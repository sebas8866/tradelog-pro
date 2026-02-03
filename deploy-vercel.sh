#!/bin/bash
# DEPLOY TRADELOG PRO TO VERCEL
# Run this script to deploy

echo "🚀 TradeLog Pro Deployment Script"
echo "=================================="
echo ""

cd /Users/henryads/.openclaw/workspace/tradelog-pro

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
echo "You may need to login first."
echo ""

vercel --prod

echo ""
echo "✨ Deployment complete!"
echo "📝 If this is your first time:"
echo "   1. Vercel will ask you to login (use henry@aitoolsdaily.com)"
echo "   2. Follow the prompts to create account"
echo "   3. Project will be deployed to: tradelog-pro.vercel.app"
echo ""
echo "🎯 After deployment:"
echo "   - Test all pages"
echo "   - Connect custom domain (optional)"
echo "   - Add analytics"
echo "   - Share on Twitter!"
