#!/bin/bash
# Vercel Deploy Helper - Run this manually

echo "🚀 Vercel Deployment Helper"
echo ""
echo "This script will:"
echo "1. Login to Vercel (create account if needed)"
echo "2. Deploy TradeLog Pro"
echo ""

# Step 1: Login
echo "Step 1: Logging in to Vercel..."
echo "Email: Henryads@agentmail.to"
echo "Password: Miami2026@"
echo ""

npx vercel login

# Step 2: Deploy
echo ""
echo "Step 2: Deploying TradeLog Pro..."
cd /Users/henryads/.openclaw/workspace/tradelog-pro

npx vercel --prod --confirm

echo ""
echo "✅ Deployment complete!"
echo "Check your Vercel dashboard for the URL"
