#!/bin/bash
# VERCEL DEPLOYMENT HELPER
# This script helps deploy TradeLog Pro to Vercel

echo "🚀 TradeLog Pro - Vercel Deployment"
echo "====================================="
echo ""

cd /Users/henryads/.openclaw/workspace/tradelog-pro

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ Build not found. Run: npm run build"
    exit 1
fi

echo "✅ Build found in dist/"
echo ""
echo "📧 Account to use:"
echo "   Email: Henryads@agentmail.to"
echo "   Password: Miami2026@"
echo ""
echo "🌐 Deployment Steps:"
echo ""
echo "Option 1: Vercel Dashboard (Easiest)"
echo "   1. Go to https://vercel.com/new"
echo "   2. Select 'Upload' option"
echo "   3. Create account: Henryads@agentmail.to / Miami2026@"
echo "   4. Upload dist/ folder"
echo "   5. Deploy!"
echo ""
echo "Option 2: Vercel CLI"
echo "   Run: npx vercel --prod"
echo "   Then login with: Henryads@agentmail.to / Miami2026@"
echo ""
echo "📁 Files ready to upload:"
ls -lh dist/*.html
echo ""
echo "🌐 Expected URL: https://tradelog-pro.vercel.app"
