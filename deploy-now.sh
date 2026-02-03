#!/bin/bash
# ONE-COMMAND DEPLOYMENT FOR TRADELOG PRO
# This script deploys TradeLog Pro to Vercel

echo "🚀 TradeLog Pro Deployment"
echo "=========================="
echo ""

# Navigate to project
cd /Users/henryads/.openclaw/workspace/tradelog-pro

# Check if already built
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm install
    npm run build
fi

echo "✅ Build complete!"
echo ""

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
echo "🌐 Deploying to Vercel..."
echo ""
echo "⚠️  You will need to:"
echo "   1. Login to Vercel (or create account)"
echo "   2. Confirm deployment"
echo ""
echo "Press Enter to continue..."
read

vercel --prod

echo ""
echo "✨ Deployment complete!"
echo ""
echo "📝 Your site will be available at:"
echo "   https://tradelog-pro.vercel.app"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the live site"
echo "   2. Share on Twitter/LinkedIn"
echo "   3. Add to newsletter"
