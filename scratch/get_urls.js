const https = require('https');

const testUrls = [
  "https://images.unsplash.com/photo-1549490349-gCWctwbJesc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1588950856950-RKk9yMOONZs?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549449343-GHQJhB2ATKM?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549449340-SByu-FXu0Pw?auto=format&fit=crop&w=1200&q=80",
];

testUrls.forEach(url => {
  https.get(url, (res) => {
    console.log(url.split('-').pop().split('?')[0], 'status:', res.statusCode, 'content-type:', res.headers['content-type']);
  });
});
