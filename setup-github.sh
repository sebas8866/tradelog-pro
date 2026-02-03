#!/bin/bash
# GitHub Setup Script for TradeLog Pro
# Run this after creating a GitHub Personal Access Token

REPO_NAME="tradelog-pro"
GITHUB_USERNAME="${GITHUB_USERNAME:-henryads}"

echo "🔧 Setting up GitHub repository for TradeLog Pro..."

# Create repo via API (requires GITHUB_TOKEN)
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    echo ""
    echo "To set up:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Generate new token (classic) with 'repo' scope"
    echo "3. Run: export GITHUB_TOKEN='your_token_here'"
    echo "4. Re-run this script"
    exit 1
fi

# Create the repository
echo "📦 Creating GitHub repository..."
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"TradeLog Pro - AI-powered trading journal with pattern recognition\",\"private\":false}"

echo ""
echo "🔗 Adding remote and pushing..."
git remote add origin "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || true
git branch -M main
git push -u origin main --force

echo ""
echo "✅ Repository created: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "🚀 Now connect to Vercel:"
echo "   1. Go to https://vercel.com/new"
echo "   2. Import Git Repository"
echo "   3. Select $REPO_NAME"
echo "   4. Deploy!"
