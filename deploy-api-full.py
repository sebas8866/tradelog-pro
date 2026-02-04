#!/usr/bin/env python3
"""
Vercel Deployment via API
Creates a new Vercel project and deploys the GitHub repo
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error

# Vercel API endpoints
VERCEL_API = "https://api.vercel.com"
GITHUB_REPO = "sebas8866/tradelog-pro"
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
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            return json.loads(error_body)
        except:
            return {"error": error_body, "status": e.code}
    except Exception as e:
        return {"error": str(e)}

def create_vercel_project(token):
    """Create a new Vercel project linked to GitHub"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Create project
    print("📦 Creating Vercel project...")
    project_data = {
        "name": PROJECT_NAME,
        "framework": "nextjs",
        "gitRepository": {
            "type": "github",
            "repo": GITHUB_REPO
        },
        "buildCommand": "npm run build",
        "outputDirectory": "dist",
        "installCommand": "npm install"
    }
    
    result = api_call(
        f"{VERCEL_API}/v9/projects",
        method="POST",
        headers=headers,
        data=project_data
    )
    
    if 'id' in result:
        print(f"✅ Project created: {result['id']}")
        return result['id']
    elif 'error' in result:
        if 'already exists' in str(result.get('error', '')):
            # Project exists, get its ID
            print("ℹ️ Project already exists, fetching ID...")
            existing = api_call(
                f"{VERCEL_API}/v9/projects/{PROJECT_NAME}",
                headers=headers
            )
            if 'id' in existing:
                return existing['id']
        print(f"❌ Error creating project: {result}")
        return None
    return None

def create_deployment(token, project_id):
    """Create a production deployment"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("🚀 Creating deployment...")
    deploy_data = {
        "name": PROJECT_NAME,
        "project": project_id,
        "gitSource": {
            "type": "github",
            "ref": "main",
            "repoId": 1149240291,
            "org": "sebas8866",
            "repo": "tradelog-pro"
        },
        "target": "production",
        "framework": "nextjs"
    }
    
    result = api_call(
        f"{VERCEL_API}/v13/deployments",
        method="POST",
        headers=headers,
        data=deploy_data
    )
    
    return result

def wait_for_deployment(token, deployment_id):
    """Poll deployment status until complete"""
    headers = {'Authorization': f'Bearer {token}'}
    
    print("⏳ Waiting for deployment to complete...")
    for i in range(30):  # Max 2.5 minutes
        time.sleep(5)
        
        result = api_call(
            f"{VERCEL_API}/v13/deployments/{deployment_id}",
            headers=headers
        )
        
        state = result.get('readyState', 'UNKNOWN')
        print(f"   Status: {state}")
        
        if state == 'READY':
            url = result.get('url', '')
            print(f"\n🎉 DEPLOYMENT SUCCESSFUL!")
            print(f"🔗 https://{url}")
            
            # Save deployment info
            with open('deployment-success.json', 'w') as f:
                json.dump({
                    'url': f"https://{url}",
                    'deployment_id': deployment_id,
                    'project': PROJECT_NAME,
                    'timestamp': time.time()
                }, f, indent=2)
            
            return True
        elif state == 'ERROR':
            print("\n❌ Deployment failed")
            return False
    
    print("\n⏰ Deployment still in progress...")
    print(f"🔗 Check: https://vercel.com/sebas8866/{PROJECT_NAME}/{deployment_id}")
    return False

def main():
    # Get token from environment
    token = os.environ.get('VERCEL_TOKEN')
    
    if not token:
        print("❌ VERCEL_TOKEN not set")
        print("\nTo get a token:")
        print("1. Go to https://vercel.com/account/tokens")
        print("2. Create a new token")
        print("3. Run: export VERCEL_TOKEN='your_token'")
        print("4. Run this script again")
        sys.exit(1)
    
    # Create project
    project_id = create_vercel_project(token)
    if not project_id:
        print("❌ Failed to create/get project")
        sys.exit(1)
    
    # Create deployment
    deploy_result = create_deployment(token, project_id)
    
    if 'id' not in deploy_result:
        print(f"❌ Failed to create deployment: {deploy_result}")
        sys.exit(1)
    
    deployment_id = deploy_result['id']
    url = deploy_result.get('url', '')
    
    print(f"✅ Deployment created: {deployment_id}")
    print(f"🌐 URL: https://{url}")
    
    # Wait for completion
    wait_for_deployment(token, deployment_id)

if __name__ == '__main__':
    main()
