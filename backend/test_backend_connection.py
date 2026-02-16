import requests
import json

# Test backend connectivity
backend_url = "http://127.0.0.1:8000"

print("Testing backend connectivity...")
print(f"Backend URL: {backend_url}")
print("-" * 50)

# Test 1: Health check
try:
    print("\n1. Testing health endpoint...")
    response = requests.get(f"{backend_url}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 2: Root endpoint
try:
    print("\n2. Testing root endpoint...")
    response = requests.get(f"{backend_url}/", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test 3: Generate simulation endpoint
try:
    print("\n3. Testing generate-simulation endpoint...")
    test_payload = {
        "title": "Test E-commerce App",
        "context": "I want to learn web development with React and Node.js",
        "level": "L3"
    }
    print(f"   Payload: {json.dumps(test_payload, indent=2)}")
    response = requests.post(
        f"{backend_url}/generate-simulation",
        json=test_payload,
        timeout=60
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   Success! Simulation ID: {data.get('simulation_id')}")
        print(f"   Title: {data.get('title')}")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "-" * 50)
print("Test complete!")
