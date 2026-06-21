import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

// ─── Utilities ────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Compress an image File and convert to WebP blob. */
async function compressToWebP(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const ratio = Math.min(maxWidth / img.naturalWidth, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.naturalWidth  * ratio)
      canvas.height = Math.round(img.naturalHeight * ratio)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('WebP conversion failed'))),
        'image/webp',
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')) }
    img.src = objectUrl
  })
}

// ─── Shared style constants ───────────────────────────────────────────────────

const S = {
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    padding: '20px 22px',
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 7,
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#0f172a',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  inputError: {
    borderColor: '#fca5a5',
    background: '#fef2f2',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 18,
  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, hint, error, charLimit, value = '', children }) {
  return (
    <div style={S.field}>
      <label style={S.label}>
        {label}
        {charLimit != null && (
          <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 8, color: value.length > charLimit ? '#dc2626' : '#94a3b8' }}>
            {value.length}/{charLimit}
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: '#94a3b8', margin: '5px 0 0' }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#dc2626', margin: '5px 0 0' }}>⚠ {error}</p>}
    </div>
  )
}

function Banner({ type, children }) {
  const styles = {
    success: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' },
    error:   { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' },
    info:    { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' },
  }
  return (
    <div style={{ ...styles[type], borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 18 }}>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BlogEditor({ mode = 'create', blogId = null }) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const [authState, setAuthState] = useState('loading') // loading | ok | denied

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [title, setTitle]           = useState('')
  const [slug, setSlug]             = useState('')
  const [content, setContent]       = useState('')
  const [metaTitle, setMetaTitle]   = useState('')
  const [metaDesc, setMetaDesc]     = useState('')
  const [keywords, setKeywords]     = useState('')
  const [altText, setAltText]       = useState('')
  const [imageUrl, setImageUrl]     = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [status, setStatus]         = useState('draft')
  const [slugLocked, setSlugLocked] = useState(false)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loadingBlog, setLoadingBlog] = useState(mode === 'edit')
  const [aiLoading, setAiLoading]     = useState(false)
  const [aiError, setAiError]         = useState('')
  const [imgUploading, setImgUploading] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fileRef = useRef(null)

  // ── Auth check ───────────────────────────────────────────────────────────────
  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthState('denied'); return }
      const { data: isAdm } = await supabase.rpc('is_admin')
      setAuthState(isAdm ? 'ok' : 'denied')
    }
    check()
  }, [])

  // ── Load blog (edit mode) ────────────────────────────────────────────────────
  useEffect(() => {
    if (authState !== 'ok' || mode !== 'edit' || !blogId) {
      setLoadingBlog(false)
      return
    }
    async function load() {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .single()

      if (error || !data) {
        setFormError('Blog not found or you do not have permission to edit it.')
        setLoadingBlog(false)
        return
      }

      setTitle(data.title ?? '')
      setSlug(data.slug ?? '')
      setContent(data.content ?? '')
      setMetaTitle(data.meta_title ?? '')
      setMetaDesc(data.meta_description ?? '')
      setKeywords((data.keywords ?? []).join(', '))
      setAltText(data.alt_text ?? '')
      setImageUrl(data.featured_image_url ?? '')
      if (data.featured_image_url) setImagePreview(data.featured_image_url)
      setStatus(data.status ?? 'draft')
      setSlugLocked(true)
      setLoadingBlog(false)
    }
    load()
  }, [authState, mode, blogId])

  // ── Auto-slug from title (create mode only) ───────────────────────────────
  useEffect(() => {
    if (mode === 'create' && !slugLocked) {
      setSlug(slugify(title))
    }
  }, [title, mode, slugLocked])

  // ── AI Optimize ──────────────────────────────────────────────────────────────
  const handleAiOptimize = useCallback(async () => {
    if (!content.trim() && !title.trim()) {
      setAiError('Add some content or a title before optimizing.')
      return
    }
    setAiLoading(true)
    setAiError('')

    try {
      const res = await fetch('/api/seo-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent: content, title }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? `HTTP ${res.status}`)

      if (result.metaTitle)        setMetaTitle(result.metaTitle)
      if (result.metaDescription)  setMetaDesc(result.metaDescription)
      if (result.keywords?.length) setKeywords(result.keywords.join(', '))
      if (result.formattedHtmlBody) setContent(result.formattedHtmlBody)
    } catch (err) {
      setAiError(err.message ?? 'AI optimization failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }, [content, title])

  // ── Image upload + WebP conversion ───────────────────────────────────────────
  const handleImageFile = useCallback(async (file) => {
    if (!file?.type.startsWith('image/')) return
    setImgUploading(true)
    setFormError('')

    try {
      const webpBlob = await compressToWebP(file)
      const baseName = file.name.replace(/\.[^.]+$/, '')
      const filename = `${Date.now()}-${slugify(baseName) || 'image'}.webp`

      const { error: upErr } = await supabase.storage
        .from('blog-images')
        .upload(filename, webpBlob, { contentType: 'image/webp', upsert: false })

      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filename)
      setImageUrl(urlData.publicUrl)
      setImagePreview(urlData.publicUrl)
    } catch (err) {
      setFormError('Image upload failed: ' + (err.message ?? 'unknown error'))
    } finally {
      setImgUploading(false)
    }
  }, [])

  // ── Form submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setFormError('')
    setSaveSuccess(false)

    if (!title.trim())         { setFormError('Title is required.'); return }
    if (!slug.trim())          { setFormError('Slug is required.'); return }
    if (metaTitle.length > 60) { setFormError('Meta Title must be under 60 characters.'); return }
    if (metaDesc.length > 160) { setFormError('Meta Description must be under 160 characters.'); return }

    setSaving(true)

    const payload = {
      title:              title.trim(),
      slug:               slug.trim().toLowerCase(),
      content:            content.trim() || null,
      meta_title:         metaTitle.trim() || null,
      meta_description:   metaDesc.trim() || null,
      keywords:           keywords.split(',').map(k => k.trim()).filter(Boolean),
      featured_image_url: imageUrl || null,
      alt_text:           altText.trim() || null,
      status,
      updated_at:         new Date().toISOString(),
    }

    try {
      if (mode === 'create') {
        const { data, error } = await supabase.from('blogs').insert(payload).select('id').single()
        if (error) throw error
        setSaveSuccess(true)
        // Brief delay so admin sees the success message, then go to edit page
        setTimeout(() => { window.location.href = `/admin/edit-blog/${data.id}` }, 1200)
      } else {
        const { error } = await supabase.from('blogs').update(payload).eq('id', blogId)
        if (error) throw error
        setSaveSuccess(true)
      }
    } catch (err) {
      setFormError(err.message ?? 'Save failed — please try again.')
    } finally {
      setSaving(false)
    }
  }, [title, slug, content, metaTitle, metaDesc, keywords, imageUrl, altText, status, mode, blogId])

  // ── Render gates ─────────────────────────────────────────────────────────────
  if (authState === 'loading') {
    return <Centred>Checking permissions…</Centred>
  }
  if (authState === 'denied') {
    return (
      <Centred>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Access denied</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Admin privileges required.</div>
          <a href="/admin" style={{ color: '#1B3A6B', fontWeight: 600, fontSize: 13 }}>← Go to Admin</a>
        </div>
      </Centred>
    )
  }
  if (loadingBlog) {
    return <Centred>Loading blog post…</Centred>
  }

  const isCreate = mode === 'create'

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              {isCreate ? '✍️ New Blog Post' : '✏️ Edit Blog Post'}
            </h1>
            {!isCreate && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                ID: {blogId}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isCreate && (
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noopener"
                style={{ fontSize: 12, color: '#1B3A6B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                👁 Preview ↗
              </a>
            )}
            <a href="/admin" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>← Admin</a>
          </div>
        </div>

        {/* ── AI Optimizer banner ─────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A6B 0%, #0f172a 100%)',
          borderRadius: 14,
          padding: '18px 22px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
              ✨ AI SEO Optimizer
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', maxWidth: 480 }}>
              Paste raw text into the editor below, then click to auto-format HTML, generate meta data, and add image placeholders.
            </div>
          </div>
          <button
            type="button"
            onClick={handleAiOptimize}
            disabled={aiLoading}
            style={{
              padding: '10px 22px',
              background: aiLoading ? '#475569' : '#E05A2B',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'background 0.15s',
            }}
          >
            {aiLoading ? '⏳ Optimizing…' : '🤖 Optimize, Format & Align'}
          </button>
        </div>

        {aiError && <Banner type="error">⚠ {aiError}</Banner>}

        {/* ── Form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>

          {/* Title */}
          <Field label="Blog Title *">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. How to Choose the Best Floor Tiles for Sri Lanka Homes"
              required
              style={S.input}
            />
          </Field>

          {/* Slug */}
          <Field
            label="URL Slug *"
            hint="Auto-generated from title. Edit only if needed."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
              <span style={{ padding: '11px 10px 11px 14px', fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                onChange={e => { setSlug(e.target.value); setSlugLocked(true) }}
                placeholder="best-floor-tiles-sri-lanka"
                required
                style={{ ...S.input, border: 'none', borderRadius: 0, flexGrow: 1, padding: '11px 14px 11px 0' }}
              />
            </div>
          </Field>

          {/* Content */}
          <Field
            label="Content (HTML / Raw Text)"
            hint='Paste raw text or existing HTML. Click "AI Optimize" to auto-convert to semantic, SEO-ready HTML.'
          >
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`Paste raw blog content here…\n\nThe AI will:\n• Convert headings to <h2>/<h3>\n• Wrap paragraphs in <p> tags\n• Bold brand names and specs with <strong>\n• Insert <image-placeholder> divs at appropriate spots\n• Format lists as <ul>/<li>`}
              rows={20}
              style={{
                ...S.input,
                resize: 'vertical',
                fontFamily: '"ui-monospace","SFMono-Regular","Consolas",monospace',
                fontSize: 12,
                lineHeight: 1.65,
              }}
            />
          </Field>

          {/* ── SEO Card ─────────────────────────────────────────── */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              🎯 SEO Metadata
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>— auto-populated by AI Optimizer</span>
            </div>

            <Field label="Meta Title" charLimit={60} value={metaTitle}>
              <input
                type="text"
                value={metaTitle}
                onChange={e => setMetaTitle(e.target.value)}
                placeholder="Catchy, keyword-rich title (under 60 chars)"
                style={{ ...S.input, ...(metaTitle.length > 60 ? S.inputError : {}) }}
              />
            </Field>

            <Field label="Meta Description" charLimit={160} value={metaDesc}>
              <textarea
                value={metaDesc}
                onChange={e => setMetaDesc(e.target.value)}
                placeholder="Compelling summary with target keyword (under 160 chars)"
                rows={2}
                style={{ ...S.input, resize: 'none', ...(metaDesc.length > 160 ? S.inputError : {}) }}
              />
            </Field>

            <Field
              label="Keywords"
              hint="Comma-separated. Auto-populated by AI — add or remove as needed."
            >
              <input
                type="text"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="floor tiles, bathroom renovation, Sri Lanka, porcelain tiles"
                style={S.input}
              />
            </Field>
          </div>

          {/* ── Featured Image Card ───────────────────────────────── */}
          <div style={{ ...S.card, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 16 }}>
              🖼️ Featured Image
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
                — auto-compressed &amp; converted to WebP
              </span>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]) }}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: 12,
                minHeight: 130,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: imgUploading ? 'wait' : 'pointer',
                background: '#f8fafc',
                marginBottom: 14,
                overflow: 'hidden',
                position: 'relative',
                transition: 'border-color 0.15s',
              }}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: 'transparent', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.color = 'transparent' }}
                  >
                    Click to replace
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📸</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    {imgUploading ? '⏳ Compressing & uploading…' : 'Click or drag image here'}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    JPG · PNG · WebP · Max 5 MB → converted to WebP automatically
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={e => handleImageFile(e.target.files?.[0])}
              style={{ display: 'none' }}
            />

            {imageUrl && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, wordBreak: 'break-all' }}>
                URL: {imageUrl}
              </div>
            )}

            <Field
              label="Alt Text"
              hint="Required for accessibility and Google Image Search SEO."
            >
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                placeholder="e.g. Large-format porcelain floor tiles installed in a modern Sri Lankan bathroom"
                style={S.input}
              />
            </Field>
          </div>

          {/* ── Status Card ──────────────────────────────────────── */}
          <div style={{
            ...S.card,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Publication Status</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                Drafts are not visible to public visitors.
              </div>
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ ...S.input, width: 'auto', minWidth: 150, cursor: 'pointer' }}
            >
              <option value="draft">📝 Draft</option>
              <option value="published">✅ Published</option>
              <option value="archived">📦 Archived</option>
            </select>
          </div>

          {/* ── Feedback ─────────────────────────────────────────── */}
          {formError  && <Banner type="error">⚠ {formError}</Banner>}
          {saveSuccess && (
            <Banner type="success">
              ✅ {isCreate ? 'Blog created! Redirecting to edit page…' : 'Changes saved successfully!'}
            </Banner>
          )}

          {/* ── Actions ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <a
              href="/admin"
              style={{
                padding: '11px 22px',
                background: '#f1f5f9',
                color: '#374151',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Cancel
            </a>

            {/* Save Draft shortcut (edit mode) */}
            {!isCreate && status !== 'published' && (
              <button
                type="submit"
                disabled={saving}
                onClick={() => setStatus('draft')}
                style={{
                  padding: '11px 22px',
                  background: saving ? '#94a3b8' : '#475569',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                💾 Save Draft
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '11px 28px',
                background: saving ? '#94a3b8' : '#1B3A6B',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              {saving
                ? '⏳ Saving…'
                : isCreate
                  ? status === 'published' ? '🚀 Publish' : '📝 Create Draft'
                  : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Loader helper ─────────────────────────────────────────────────────────────
function Centred({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', color: '#64748b', fontSize: 14, flexDirection: 'column', gap: 12,
    }}>
      {children}
    </div>
  )
}
