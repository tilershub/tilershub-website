import { SERVICES } from '../lib/services.js'
import { BLOG_POSTS } from '../lib/blog-posts.js'
import { jobPath } from '../lib/jobs.js'
import { GUIDES } from '../data/guides.js'
import { DISTRICT_INFO, LOCATION_SERVICE_SLUGS, districtPath, serviceDistrictPath } from '../lib/locations.js'

export const prerender = false

const BASE = 'https://www.tilershub.lk'

const STATIC = [
  { loc: '/',               priority: '1.0', changefreq: 'daily'   },
  { loc: '/providers',      priority: '0.9', changefreq: 'daily'   },
  { loc: '/jobs',           priority: '0.9', changefreq: 'hourly'  },
  { loc: '/blog',           priority: '0.8', changefreq: 'weekly'  },
  { loc: '/post-project',   priority: '0.8', changefreq: 'monthly' },
  { loc: '/join-tilershub', priority: '0.7', changefreq: 'monthly' },
  { loc: '/categories',     priority: '0.7', changefreq: 'weekly'  },
  { loc: '/guides',         priority: '0.7', changefreq: 'weekly'  },
  { loc: '/estimator',      priority: '0.6', changefreq: 'monthly' },
  { loc: '/bathrooms',      priority: '0.6', changefreq: 'weekly'  },
  { loc: '/tile',           priority: '0.6', changefreq: 'weekly'  },
  { loc: '/tools',          priority: '0.5', changefreq: 'monthly' },
  { loc: '/about',          priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact',        priority: '0.5', changefreq: 'monthly' },
]

function url(loc, lastmod, changefreq, priority) {
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

export async function GET({ locals }) {
  const today = new Date().toISOString().split('T')[0]

  const [{ data: tilerRows }, { data: providerRows }, { data: projectRows }] = await Promise.all([
    locals.supabase.from('tilers').select('slug,updated_at').eq('is_verified', true).not('slug', 'is', null),
    locals.supabase.from('providers').select('slug,updated_at').not('slug', 'is', null),
    locals.supabase.from('projects').select('id,project_type,city,district,created_at').eq('status', 'active').order('created_at', { ascending: false }).limit(500),
  ])

  const urls = [
    ...STATIC.map(u => url(u.loc, today, u.changefreq, u.priority)),
    ...SERVICES.map(s => url(`/services/${s.slug}`, today, 'weekly', '0.8')),
    ...BLOG_POSTS.map(p => url(`/blog/${p.slug}`, today, 'monthly', '0.7')),
    ...(tilerRows || []).filter(r => r.slug).map(t =>
      url(`/tilers/${t.slug}`, t.updated_at ? t.updated_at.split('T')[0] : today, 'weekly', '0.8')
    ),
    ...(providerRows || []).filter(r => r.slug).map(p =>
      url(`/providers/${p.slug}`, p.updated_at ? p.updated_at.split('T')[0] : today, 'weekly', '0.7')
    ),
    ...(projectRows || []).map(p =>
      url(jobPath(p), p.created_at ? p.created_at.split('T')[0] : today, 'daily', '0.7')
    ),
    ...GUIDES.map(g => url(`/guides/${g.slug}`, today, 'monthly', '0.7')),
    ...DISTRICT_INFO.map(d => url(districtPath(d), today, 'weekly', '0.8')),
    ...DISTRICT_INFO.flatMap(d =>
      LOCATION_SERVICE_SLUGS.map(s => url(serviceDistrictPath(s, d), today, 'weekly', '0.7'))
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
