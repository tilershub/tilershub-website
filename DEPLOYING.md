# Deploying TilersHub

## The one path that ships the site

```
push to claude/**  →  .github/workflows/auto-merge.yml
                      ├─ npm ci && npm run build
                      ├─ merge into main
                      └─ wrangler deploy      ← this is what serves tilershub.lk
```

The site is a **Cloudflare Worker**, not a Pages site. `wrangler.toml` declares
`main = "./dist/_worker.js/index.js"` with `[assets]` for the static files, and
`npm run deploy` is `wrangler deploy`.

Nothing needs running by hand. A push to the branch builds, merges and deploys.
If the merge conflicts the job fails, skips the deploy, and opens an issue
labelled `auto-merge-failed` — because a push succeeding tells you nothing about
what happened afterwards.

`.github/workflows/deploy.yml` covers direct pushes to `main` by a human. It does
**not** fire for the auto-merge job's push: GitHub deliberately stops a push made
with `GITHUB_TOKEN` from triggering other workflows. So there is no double deploy.

## Hostname

`tilershub.lk` (apex) is canonical and serves 200. `www.tilershub.lk` 301s to it.
Every canonical tag, the sitemap and `robots.txt` use the apex — keep it that way,
or Search Console reports the whole sitemap as "Page with redirect".

## There is also a Cloudflare Pages project, and it does nothing

A Git-connected **Pages** build runs on every push, builds successfully, then
fails on its last step:

```
Executing user deploy command: npx wrangler pages deploy ./dist
✘ [ERROR] Must specify a project name.
```

It deploys nothing — the Worker above is what serves the site — so this is noise:
wasted build minutes and a failure notification per push.

**To fix, in the Cloudflare dashboard** (Workers & Pages → the *Pages* project,
not the Worker of the same name):

- **Preferred:** delete the Pages project, or disconnect its Git integration.
- **To keep it** as a preview: set its deploy command to
  `npx wrangler pages deploy ./dist --project-name=<pages project name>`.

The build log also warns that `wrangler.toml` lacks `pages_build_output_dir`.
Adding it is not the fix — it is a Pages-only key, and on the pinned wrangler 3
it is simply passed through as a Worker var (verified with
`wrangler deploy --dry-run`: the deploy still succeeds, but the binding list
grows a junk `pages_build_output_dir` entry). Fix the Pages project in the
dashboard instead of bending the Workers config around it.

## Secrets

Set in Cloudflare → Workers & Pages → `tilershub` → Variables and Secrets, never
in `wrangler.toml` (it is committed):

- `ANTHROPIC_API_KEY` — the admin blog SEO assistant
- `SUPABASE_SERVICE_ROLE_KEY` — admin auth-account operations

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are public and live in `wrangler.toml`.
`PUBLIC_ADSENSE_CLIENT` is in `.env.production`: it reaches the browser by
design, which is why it is not a secret.

Read secrets server-side through `serverSecret()` in `src/lib/secrets.ts` — on
Cloudflare, `import.meta.env` only carries build-time values, so a route reading
a secret from there works locally and returns `undefined` in production.

## Checks

```sh
npm run check:schema    # every DB column the code references exists
npm run check:adsense   # consent gating, legal pages, ad tag ordering
npm run check:crawl     # 160 pages: no non-200s, canonicals, titles, h1s
```

`check:adsense` and `check:crawl` need `npm run dev` running, and
`check:adsense` reads `dist/` for the ad-tag assertions, so build first.
