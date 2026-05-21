# 🏠 TilersHub — ශ්‍රී ලංකාවේ #1 ටයිල් වේදිකාව

React + Supabase + Cloudflare Pages powered marketplace connecting tilers and homeowners in Sri Lanka.

## 🔧 Tech Stack
- **Frontend**: React 18 + Vite + React Router
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Hosting**: Cloudflare Pages
- **Language**: සිංහල (Sinhala)

## 🗄️ Supabase Project
- **URL**: https://ginrgwaciblcvxvkbeyd.supabase.co
- **Project**: TilersHub (ap-southeast-1)

## 🚀 Deploy to Cloudflare Pages

### Option 1: Dashboard (easiest)
1. Go to https://dash.cloudflare.com → Pages → Create a project
2. Connect your GitHub repo
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Done!

### Option 2: CLI (one command)
```bash
# Install wrangler if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build && wrangler pages deploy dist --project-name=tilershub
```

### Option 3: GitHub Actions (auto-deploy)
1. Push this repo to GitHub
2. Add these secrets in repo Settings → Secrets:
   - `CLOUDFLARE_API_TOKEN` — from https://dash.cloudflare.com/profile/api-tokens
   - `CLOUDFLARE_ACCOUNT_ID` — from https://dash.cloudflare.com
3. Every push to `main` auto-deploys ✅

## 📦 Local Development
```bash
npm install
npm run dev
```

## 🗃️ Database Schema
- `profiles` — All users (tilers + homeowners) linked to Supabase Auth
- `tilers` — Tiler-specific profile data (services, rates, experience)
- `reviews` — Star ratings + comments
- `contact_events` — WhatsApp contact analytics
- `tiler_profiles` — View joining all tiler data + computed ratings

## 💬 WhatsApp Integration
When a homeowner clicks "සම්බන්ධ වන්න", WhatsApp opens with a pre-filled message:
> "ආයුබෝවන්! 🙏 මම TilersHub (www.tilershub.lk) හරහා ඔබව සොයාගතිමි..."

A `contact_event` is also logged to Supabase for analytics.

## 🔒 Security
- Row Level Security (RLS) enabled on all tables
- Tilers can only edit their own profiles
- Avatar storage scoped to user folders
- Auth handled by Supabase (email/password)
