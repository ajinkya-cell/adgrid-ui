import requests

test_urls = [
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549490349-gCWctwbJesc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1588950856950-RKk9yMOONZs?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549449343-GHQJhB2ATKM?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549449340-SByu-FXu0Pw?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-gCWctwbJesc?auto=format&fit=crop&w=1200&q=80"
]

for url in test_urls:
    res = requests.head(url)
    print(url.split('/')[-1][:30], "->", res.status_code, res.headers.get('Content-Type'))
