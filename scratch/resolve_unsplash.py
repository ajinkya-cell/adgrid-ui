import urllib.request
import re

urls = [
    'https://unsplash.com/photos/delicate-white-flowers-against-a-dark-blurred-background-gCWctwbJesc',
    'https://unsplash.com/photos/purple-flower-in-close-up-photography-RKk9yMOONZs',
    'https://unsplash.com/photos/close-up-of-a-flower-HNh9EfacXXM',
    'https://unsplash.com/photos/white-flower-in-tilt-shift-lens-GHQJhB2ATKM',
    'https://unsplash.com/photos/a-close-up-of-a-flower-SByu-FXu0Pw'
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

for url in urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'https://images\.unsplash\.com/photo-[0-9a-fA-F-]+', html)
            og = re.findall(r'property="og:image"\s+content="([^"]+)"', html)
            print("URL:", url)
            print("Matches:", matches[:3])
            print("OG:", og[:1])
            print("-" * 50)
    except Exception as e:
        print("URL:", url, "ERROR:", e)
