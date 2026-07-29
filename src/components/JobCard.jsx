import { useState, useEffect } from 'react'
import { useLang } from '../lib/useLang.js'
import { JOB_TYPE_ICONS, jobPath, timeAgo, shortDate } from '../lib/jobs.js'

/**
 * JobCard — one posted project, in every list that shows one.
 *
 * variant 'feed'  → browse: category, where, budget, bid count
 * variant 'match' → provider home: same, plus a quote button
 * variant 'mine'  → client home: status pill and "quotes to review"
 *
 * Takes a raw `projects` row, so callers pass query results straight through.
 */

const T = {
  quotes:  { en: 'quotes',           si: 'ලංසු' },
  review:  { en: 'quotes to review', si: 'ලංසු බලන්න' },
  budget:  { en: 'Budget',           si: 'මුදල' },
  where:   { en: 'Where',            si: 'ස්ථානය' },
  quote:   { en: 'Quote',            si: 'ලංසු දෙන්න' },
  open:    { en: 'Open',             si: 'විවෘත' },
  matched: { en: 'Matched',          si: 'ගැළපුණි' },
  done:    { en: 'Completed',        si: 'නිම විය' },
  pending: { en: 'Under review',     si: 'සමාලෝචනයේ' },
}

const STATUS = {
  active:         { key: 'open',    tone: 'open' },
  matched:        { key: 'matched', tone: 'booked' },
  completed:      { key: 'done',    tone: 'closed' },
  pending_review: { key: 'pending', tone: 'closed' },
}

export default function JobCard({ job, variant = 'feed', bidCount = 0, href }) {
  const lang = useLang()
  const t = k => T[k]?.[lang] || T[k]?.en || k
  const status = STATUS[job.status] || STATUS.active
  const place = [job.city, job.district !== job.city ? job.district : null].filter(Boolean).join(', ')

  // An absolute date on first paint, relative once mounted: timeAgo reads
  // Date.now(), which the server and the browser disagree about by enough to
  // land either side of a bucket boundary and break hydration.
  const [posted, setPosted] = useState(() => shortDate(job.created_at, true))
  useEffect(() => { setPosted(timeAgo(job.created_at, lang)) }, [job.created_at, lang])

  return (
    <a href={href || jobPath(job)} className="th-card th-card--tap" style={{ display: 'block', color: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        {variant === 'mine'
          ? <span className={`th-pill th-pill--${status.tone}`}>{t(status.key)}</span>
          : <span className="th-pill th-pill--open">{JOB_TYPE_ICONS[job.project_type] || '🏠'} {job.project_type}</span>}
        <span style={{ flex: 1 }} />
        <span style={{ font: '500 11.5px var(--th-body)', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
          {posted}
        </span>
      </div>

      {variant === 'mine' && (
        <h3 style={{ fontSize: 16, lineHeight: 1.22, margin: '0 0 6px' }}>{job.project_type}</h3>
      )}

      {job.description && variant !== 'mine' && (
        <p style={{
          margin: '0 0 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-2)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{job.description}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
        {job.budget_range && (
          <div style={{ minWidth: 0 }}>
            <div style={{ font: '500 9.5px var(--th-body)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{t('budget')}</div>
            <div style={{ font: '700 13.5px var(--th-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.budget_range}</div>
          </div>
        )}
        {place && variant !== 'mine' && (
          <div style={{ minWidth: 0 }}>
            <div style={{ font: '500 9.5px var(--th-body)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{t('where')}</div>
            <div style={{ font: '600 12.5px var(--th-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place}</div>
          </div>
        )}

        <span style={{ flex: 1 }} />

        {variant === 'match' ? (
          <span className="th-btn th-btn--primary" style={{ minHeight: 36, padding: '0 15px', fontSize: 12.5 }}>{t('quote')}</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap' }}>
            <span style={{ font: '700 14px var(--th-display)', color: bidCount > 0 ? 'var(--th-forest)' : 'var(--text-4)' }}>{bidCount}</span>
            <span style={{ font: '500 11.5px var(--th-body)', color: 'var(--text-3)' }}>
              {variant === 'mine' ? t('review') : t('quotes')}
            </span>
          </div>
        )}
      </div>
    </a>
  )
}
