import requests

ids = ['gCWctwbJesc', 'RKk9yMOONZs', 'HNh9EfacXXM', 'GHQJhB2ATKM', 'SByu-FXu0Pw']

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': '*/*',
}

for photo_id in ids:
    url = f"https://unsplash.com/napi/photos/{photo_id}"
    resp = requests.get(url, headers=headers)
    print(photo_id, "napi status:", resp.status_code)
    if resp.status_code == 200:
        data = resp.json()
        print("Raw URL:", data.get('urls', {}).get('raw'))
        print("Full URL:", data.get('urls', {}).get('full'))
        print("Regular URL:", data.get('urls', {}).get('regular'))
        print("Description:", data.get('alt_description') or data.get('description'))
        print("-" * 50)
