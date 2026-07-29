import { useLang } from '../lib/useLang.js'

/**
 * BidCard — one quote a provider sent on a project, as the homeowner sees it.
 *
 * Two actions and no ambiguity about which is which: open the profile to
 * check them out, or message them. Both are separate targets rather than a
 * whole-card link with buttons inside it, which is what the previous markup
 * did — nesting an <a> inside an <a> is invalid and made the WhatsApp button
 * depend on stopPropagation to work at all.
 *
 * `bid` is a raw `bids` row; `provider` is the matching `providers` row when
 * the quote came from a listed profile.
 */

const T = {
  profile:  { en: 'View profile', si: 'පැතිකඩ බලන්න' },
  whatsapp: { en: 'WhatsApp',     si: 'WhatsApp' },
  isNew:    { en: 'New',          si: 'නව' },
  noReview: { en: 'No reviews yet', si: 'තවම සමාලෝචන නැත' },
}

const WA_TEXT = "Hi! 👋\n\nI saw your quote on TilersHub. Let's discuss it.\n\nThank you!"

function waLink(number) {
  const digits = String(number || '').replace(/\D/g, '')
  if (!digits) return null
  const intl = digits.startsWith('94') ? digits : '94' + digits.replace(/^0/, '')
  return `https://wa.me/${intl}?text=${encodeURIComponent(WA_TEXT)}`
}

export default function BidCard({ bid, provider = null }) {
  const lang = useLang()
  const t = k => T[k]?.[lang] || T[k]?.en || k
  const href = bid.provider_slug ? `/providers/${bid.provider_slug}` : null
  const wa = waLink(bid.bidder_whatsapp)
  const initial = (bid.bidder_name || '?')[0].toUpperCase()

  return (
    <div className="th-card" style={{ padding: 15, borderLeftWidth: 4, borderLeftColor: bid.status === 'new' ? 'var(--terra)' : 'var(--border)' }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
        {provider?.profile_image
          ? <img src={provider.profile_image} alt="" width="40" height="40" style={{ width: 40, height: 40, flex: 'none', borderRadius: 10, objectFit: 'cover' }} />
          : <div style={{ width: 40, height: 40, flex: 'none', borderRadius: 10, background: 'var(--navy)', color: '#fff', display: 'grid', placeItems: 'center', font: '700 14px var(--th-display)' }}>{initial}</div>}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ font: '700 14.5px var(--th-display)', letterSpacing: '-0.02em' }}>{bid.bidder_name}</span>
            {bid.status === 'new' && <span className="th-pill th-pill--open">{t('isNew')}</span>}
          </div>
          <div style={{ font: '500 11.5px var(--th-body)', color: 'var(--text-3)', display: 'flex', flexWrap: 'wrap', gap: '0 8px' }}>
            {provider && (provider.avg_rating > 0
              ? <span>★ {Number(provider.avg_rating).toFixed(1)} ({provider.review_count || 0})</span>
              : <span>{t('noReview')}</span>)}
            {provider?.city && <span>📍 {provider.city}</span>}
            {!provider && bid.bidder_type && <span style={{ textTransform: 'capitalize' }}>{bid.bidder_type}</span>}
            {bid.timeline && <span>· {bid.timeline}</span>}
          </div>
        </div>

        {bid.quote_amount != null && (
          <div style={{ textAlign: 'right', flex: 'none' }}>
            <div style={{ font: '800 17px var(--th-display)', letterSpacing: '-0.03em' }}>
              Rs. {Number(bid.quote_amount).toLocaleString('en-US')}
            </div>
          </div>
        )}
      </div>

      {bid.message && (
        <p style={{ margin: '0 0 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-2)' }}>
          {bid.message.length > 200 ? bid.message.slice(0, 200) + '…' : bid.message}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {href && (
          <a className="th-btn th-btn--ghost" style={{ flex: 1, minHeight: 42, fontSize: 12.5 }} href={href} target="_blank" rel="noopener">
            {t('profile')}
          </a>
        )}
        {wa && (
          <a className="th-btn th-btn--whatsapp" style={{ flex: 1, minHeight: 42, fontSize: 12.5 }} href={wa} target="_blank" rel="noopener noreferrer">
            💬 {t('whatsapp')}
          </a>
        )}
      </div>
    </div>
  )
}
