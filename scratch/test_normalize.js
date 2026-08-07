const UNSPLASH_PAGE_MAP = {
  "gCWctwbJesc": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  "RKk9yMOONZs": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
  "HNh9EfacXXM": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80",
  "GHQJhB2ATKM": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
  "SByu-FXu0Pw": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
};

function normalizeImageUrl(url) {
  if (!url) return url;
  for (const key of Object.keys(UNSPLASH_PAGE_MAP)) {
    if (url.includes(key)) {
      return UNSPLASH_PAGE_MAP[key];
    }
  }
  return url;
}

const inputs = [
  "https://unsplash.com/photos/delicate-white-flowers-against-a-dark-blurred-background-gCWctwbJesc",
  "https://unsplash.com/photos/purple-flower-in-close-up-photography-RKk9yMOONZs",
  "https://unsplash.com/photos/close-up-of-a-flower-HNh9EfacXXM",
  "https://unsplash.com/photos/white-flower-in-tilt-shift-lens-GHQJhB2ATKM",
  "https://unsplash.com/photos/a-close-up-of-a-flower-SByu-FXu0Pw",
];

inputs.forEach((inp, i) => {
  console.log(`[${i}]`, inp.split('-').pop(), '=>', normalizeImageUrl(inp));
});
