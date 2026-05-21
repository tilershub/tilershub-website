#!/bin/bash
# TilersHub - Cloudflare Pages Deploy Script
# Usage: CLOUDFLARE_API_TOKEN=your_token CLOUDFLARE_ACCOUNT_ID=your_account_id ./deploy.sh

set -e

echo "🏗️  Building TilersHub..."
npm run build

echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy dist \
  --project-name=tilershub \
  --branch=main

echo "✅ Deployed! Visit: https://tilershub.pages.dev"
