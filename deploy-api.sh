#!/bin/bash
# Vercel Deployment Script for TradeLog Pro
# Requires VERCEL_TOKEN environment variable

set -e

REPO_URL="https://github.com/sebas8866/tradelog-pro"
PROJECT_NAME="tradelog-pro"

echo "🚀 Deploying TradeLog Pro to Vercel..."

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN not set"
    echo ""
    echo "To get your token:"
    echo "1. Go to https://vercel.com/account/tokens"
    echo "2. Create a new token"
    echo "3. Run: export VERCEL_TOKEN='your_token_here'"
    exit 1
fi

# Check if project exists
echo "📦 Checking if project exists..."
PROJECT_ID=$(curl -s "https://api.vercel.com/v9/projects/$PROJECT_NAME" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.id // empty')

if [ -z "$PROJECT_ID" ]; then
    echo "🆕 Creating new project..."
    PROJECT_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v9/projects" \
      -H "Authorization: Bearer $VERCEL_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"name\": \"$PROJECT_NAME\",
        \"framework\": \"nextjs\",
        \"gitRepository\": {
          \"type\": \"github\",
          \"repo\": \"sebas8866/tradelog-pro\"
        }
      }")
    
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id // empty')
    
    if [ -z "$PROJECT_ID" ]; then
        echo "❌ Failed to create project"
        echo "$PROJECT_RESPONSE"
        exit 1
    fi
    
    echo "✅ Project created: $PROJECT_ID"
else
    echo "✅ Project exists: $PROJECT_ID"
fi

# Create deployment
echo "🔨 Creating deployment..."
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"project\": \"$PROJECT_ID\",
    \"gitSource\": {
      \"type\": \"github\",
      \"ref\": \"main\",
      \"repoId\": 1149240291,
      \"org\": \"sebas8866\",
      \"repo\": \"tradelog-pro\"
    },
    \"target\": \"production\"
  }")

DEPLOYMENT_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.id // empty')
DEPLOYMENT_URL=$(echo "$DEPLOY_RESPONSE" | jq -r '.url // empty')

if [ -z "$DEPLOYMENT_ID" ]; then
    echo "❌ Failed to create deployment"
    echo "$DEPLOY_RESPONSE"
    exit 1
fi

echo "✅ Deployment created: $DEPLOYMENT_ID"
echo "🌐 URL: https://$DEPLOYMENT_URL"
echo ""
echo "⏳ Waiting for deployment to complete..."

# Poll for deployment status
for i in {1..30}; do
    sleep 5
    STATUS_RESPONSE=$(curl -s "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID" \
      -H "Authorization: Bearer $VERCEL_TOKEN")
    
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.readyState // empty')
    
    echo "   Status: $STATUS"
    
    if [ "$STATUS" = "READY" ]; then
        echo ""
        echo "🎉 DEPLOYMENT SUCCESSFUL!"
        echo "🔗 https://$DEPLOYMENT_URL"
        exit 0
    elif [ "$STATUS" = "ERROR" ]; then
        echo ""
        echo "❌ Deployment failed"
        exit 1
    fi
done

echo ""
echo "⏰ Deployment is still in progress..."
echo "🔗 Check status at: https://vercel.com/sebas8866/$PROJECT_NAME/$DEPLOYMENT_ID"
