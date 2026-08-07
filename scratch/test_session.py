import requests
import re

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
})

# First visit homepage to get cookies
r0 = session.get('https://unsplash.com')
print("Home status:", r0.status_code)

ids = [
    'gCWctwbJesc',
    'RKk9yMOONZs',
    'HNh9EfacXXM',
    'GHQJhB2ATKM',
    'SByu-FXu0Pw'
]

for pid in ids:
    url = f'https://unsplash.com/photos/{pid}'
    r = session.get(url)
    print(pid, "status:", r.status_code)
    if r.status_code == 200:
        # Find og:image
        m = re.search(r'property="og:image"\s+content="([^"]+)"', r.text)
        print("  og:image ->", m.group(1) if m else "None")
