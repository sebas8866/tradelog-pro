#!/bin/bash
# TRADELOG PRO - QUICK DEPLOY SCRIPT
# Run this to deploy to Vercel

echo "🚀 Deploying TradeLog Pro to Vercel..."

cd /Users/henryads/.openclaw/workspace/tradelog-pro

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 To deploy to Vercel:"
    echo "   1. Go to https://vercel.com/new"
    echo "   2. Import from GitHub (create repo first)"
    echo "   3. Deploy"
    echo ""
    echo "📁 Build output: ./.next"
    echo "✨ Ready for deployment!"
else
    echo "❌ Build failed. Check errors above."
fi
