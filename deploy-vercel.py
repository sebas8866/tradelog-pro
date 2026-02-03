#!/usr/bin/env python3
"""Vercel Deployment Script for TradeLog Pro"""

import os
import sys
import json
import time
import urllib.request
import urllib.error

REPO_URL = "https://github.com/sebas8866/tradelog-pro"
PROJECT_NAME = "tradelog-pro"

def api_call(url, method="GET", data=None, headers=None):
    """Make API call to Vercel"""
    req = urllib.request.Request(url, method=method)
    
    if headers:
        for key, value in headers.items():
            req.add_header(key, value)
    
    if data:
        req.add_header('Content-Type', 'application/json')
        req.data = json.dumps(data).encode('utf-8')
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8'))

def main():
    token = os.environ.get('VERCEL_TOKEN')
    
    if not token:
        print("❌ VERCEL_TOKEN not set")
        print("")
        print("To get your token:")
        print("1. Go to https://vercel.com/account/tokens")
        print("2. Create a new token")
        print("3. Run: export VERCEL_TOKEN='your_token_here'")
        print("4. Run this script again")
        sys.exit(1)
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("🚀 Deploying TradeLog Pro to Vercel...")
    print("")
    
    # Check if project exists
    print("📦 Checking if project exists...")
    project = api_call(
        f"https://api.vercel.com/v9/projects/{PROJECT_NAME}",
        headers=headers
    )
    
    if 'id' in project:
        project_id = project['id']
        print(f"✅ Project exists: {project_id}")
    else:
        print("🆕 Creating new project...")
        project = api_call(
            "https://api.vercel.com/v9/projects",
            method="POST",
            headers=headers,
            data={
                "name": PROJECT_NAME,
                "framework": "nextjs",
                "gitRepository": {
                    "type": "github",
                    "repo": "sebas8866/tradelog-pro"
                }
            }
        )
        
        if 'id' not in project:
            print("❌ Failed to create project")
            print(json.dumps(project, indent=2))
            sys.exit(1)
        
        project_id = project['id']
        print(f"✅ Project created: {project_id}")
    
    # Create deployment
    print("")
    print("🔨 Creating deployment...")
    
    deployment = api_call(
        "https://api.vercel.com/v13/deployments",
        method="POST",
        headers=headers,
        data={
            "name": PROJECT_NAME,
            "project": project_id,
            "gitSource": {
                "type": "github",
                "ref": "main",
                "repoId": 1149240291,
                "org": "sebas8866",
                "repo": "tradelog-pro"
            },
            "target": "production"
        }
    )
    
    if 'id' not in deployment:
        print("❌ Failed to create deployment")
        print(json.dumps(deployment, indent=2))
        sys.exit(1)
    
    deployment_id = deployment['id']
    deployment_url = deployment.get('url', '')
    
    print(f"✅ Deployment created: {deployment_id}")
    print(f"🌐 URL: https://{deployment_url}")
    print("")
    print("⏳ Waiting for deployment to complete...")
    
    # Poll for deployment status
    for i in range(30):
        time.sleep(5)
        
        status = api_call(
            f"https://api.vercel.com/v13/deployments/{deployment_id}",
            headers=headers
        )
        
        ready_state = status.get('readyState', 'UNKNOWN')
        print(f"   Status: {ready_state}")
        
        if ready_state == 'READY':
            print("")
            print("🎉 DEPLOYMENT SUCCESSFUL!")
            print(f"🔗 https://{deployment_url}")
            
            # Save deployment info
            with open('deployment-info.json', 'w') as f:
                json.dump({
                    'url': f"https://{deployment_url}",
                    'id': deployment_id,
                    'project': PROJECT_NAME,
                    'timestamp': time.time()
                }, f, indent=2)
            
            return
        elif ready_state == 'ERROR':
            print("")
            print("❌ Deployment failed")
            sys.exit(1)
    
    print("")
    print("⏰ Deployment is still in progress...")
    print(f"🔗 Check status at: https://vercel.com/sebas8866/{PROJECT_NAME}/{deployment_id}")

if __name__ == '__main__':
    main()
