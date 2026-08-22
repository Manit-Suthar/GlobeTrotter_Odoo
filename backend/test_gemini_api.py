import json
import urllib.request
import urllib.error

url = 'http://localhost:8000/api/ai/intent'
data = {
    "title": "Summer vacation in Japan",
    "start_date": "2024-07-01",
    "end_date": "2024-07-15",
    "description": "I want to visit Tokyo, Kyoto, and Osaka. I love food, history, and fast-paced travel. My budget is mid-range. No seafood."
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print("Error:", e)
