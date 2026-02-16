#!/usr/bin/env python3
"""
Direct test of the FastAPI /generate-simulation endpoint
This bypasses Next.js to test if the backend works
"""
import requests
import json
import time

backend_url = "http://127.0.0.1:8000"

print("=" * 60)
print("TESTING DIRECT BACKEND API CONNECTION")
print("=" * 60)

# Test payload
payload = {
    "title": "Simple Todo App",
    "context": "I'm a beginner learning web development with React",
    "level": "L2"
}

print(f"\n📡 Sending POST request to: {backend_url}/generate-simulation")
print(f"📦 Payload: {json.dumps(payload, indent=2)}")
print("\n⏳ Waiting for response (this may take 10-30 seconds)...\n")

start_time = time.time()

try:
    response = requests.post(
        f"{backend_url}/generate-simulation",
        json=payload,
        timeout=120  # 2 minute timeout
    )
    
    elapsed = time.time() - start_time
    
    print(f"✅ Response received in {elapsed:.2f} seconds")
    print(f"📊 Status Code: {response.status_code}")
    print(f"📏 Response Size: {len(response.text)} bytes")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ SUCCESS!")
        print(f"   Simulation ID: {data.get('simulation_id', 'N/A')}")
        print(f"   Title: {data.get('title', 'N/A')}")
        print(f"   Simulation Data Keys: {list(data.get('simulation_data', {}).keys())}")
    else:
        print(f"\n❌ ERROR Response:")
        print(response.text[:500])
        
except requests.exceptions.Timeout:
    elapsed = time.time() - start_time
    print(f"\n⏰ REQUEST TIMED OUT after {elapsed:.2f} seconds")
    print("   This means the backend is hanging or taking too long")
    print("   Check the backend terminal for errors")
    
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ CONNECTION ERROR: {e}")
    print("   Make sure the backend is running on http://127.0.0.1:8000")
    
except Exception as e:
    print(f"\n❌ UNEXPECTED ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
