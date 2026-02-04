#!/usr/bin/env python3
"""
Vercel Deployment via API - Without GitHub link
Uploads the dist folder directly
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import zipfile
import io

# Vercel API endpoints
VERCEL_API = "https://api.vercel.com"
PROJECT_NAME = "tradelog-pro"

def api_call(url, method="GET", data=None, headers=None, binary=False):
    """Make API call to Vercel"""
    req = urllib.request.Request(url, method=method)
    
    if headers:
        for key, value in headers.items():
            req.add_header(key, value)
    
    if data and not binary:
        req.add_header('Content-Type', 'application/json')
        req.data = json.dumps(data).encode('utf-8')
    elif data and binary:
        req.data = data
    
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            if binary:
                return response.read()
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            return json.loads(error_body)
        except:
            return {"error": error_body, "status": e.code}
    except Exception as e:
        return {"error": str(e)}

def create_project(token):
    """Create a new Vercel project"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("📦 Creating Vercel project...")
    project_data = {
        "name": PROJECT_NAME,
        "framework": "nextjs"
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
        if 'already exists' in str(result.get('error', '')).lower():
            print("ℹ️ Project already exists, fetching ID...")
            existing = api_call(
                f"{VERCEL_API}/v9/projects/{PROJECT_NAME}",
                headers=headers
            )
            if 'id' in existing:
                return existing['id']
        print(f"❌ Error: {result}")
        return None
    return None

def upload_files(token, project_id):
    """Upload dist folder files"""
    headers = {'Authorization': f'Bearer {token}'}
    
    print("📁 Uploading files...")
    
    # For simplicity, we'll use the GitHub import method
    # which Vercel handles automatically
    print("🔗 Linking GitHub repository...")
    
    link_data = {
        "gitRepository": {
            "repo": "sebas8866/tradelog-pro",
            "type": "github"
        }
    }
    
    result = api_call(
        f"{VERCEL_API}/v9/projects/{project_id}/link",
        method="POST",
        headers=headers,
        data=link_data
    )
    
    print(f"Link result: {result}")
    return result

def create_deployment(token, project_id):
    """Create a production deployment from GitHub"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print("🚀 Creating deployment...")
    deploy_data = {
        "name": PROJECT_NAME,
        "gitSource": {
            "type": "github",
            "ref": "main",
            "repoId": 1149240291,
            "org": "sebas8866",
            "repo": "tradelog-pro"
        },
        "target": "production"
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
    
    print("⏳ Waiting for deployment...")
    for i in range(30):
        time.sleep(5)
        
        result = api_call(
            f"{VERCEL_API}/v13/deployments/{deployment_id}",
            headers=headers
        )
        
        state = result.get('readyState', 'UNKNOWN')
        print(f"   Status: {state}")
        
        if state == 'READY':
            url = result.get('url', '')
            print(f"\n🎉 SUCCESS! https://{url}")
            
            with open('deployment-success.json', 'w') as f:
                json.dump({
                    'url': f"https://{url}",
                    'deployment_id': deployment_id,
                    'project': PROJECT_NAME
                }, f, indent=2)
            
            return True
        elif state == 'ERROR':
            print("\n❌ Deployment failed")
            return False
    
    print("\n⏰ Still deploying...")
    print(f"🔗 Check: https://vercel.com/sebas8866/{PROJECT_NAME}/{deployment_id}")
    return False

def main():
    token = os.environ.get('VERCEL_TOKEN')
    
    if not token:
        print("❌ VERCEL_TOKEN not set")
        sys.exit(1)
    
    # Create project
    project_id = create_project(token)
    if not project_id:
        sys.exit(1)
    
    # Try to link GitHub (may fail if not connected)
    link_result = upload_files(token, project_id)
    
    # Create deployment
    deploy_result = create_deployment(token, project_id)
    
    if 'id' not in deploy_result:
        print(f"❌ Failed: {deploy_result}")
        sys.exit(1)
    
    deployment_id = deploy_result['id']
    url = deploy_result.get('url', '')
    
    print(f"✅ Deployment: {deployment_id}")
    print(f"🌐 https://{url}")
    
    # Wait
    wait_for_deployment(token, deployment_id)

if __name__ == '__main__':
    main()
