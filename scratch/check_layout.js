const fs = require('fs');

async function test() {
  try {
    const res = await fetch('http://localhost:3001/components/animated/image-reveal');
    const text = await res.text();
    console.log("Status:", res.status);
    
    // Search for sp-layout
    const spLayoutIndex = text.indexOf('sp-layout');
    if (spLayoutIndex !== -1) {
      console.log("sp-layout found! Context:");
      const start = Math.max(0, spLayoutIndex - 100);
      const end = Math.min(text.length, spLayoutIndex + 300);
      console.log(text.substring(start, end));
    } else {
      console.log("sp-layout not found in HTML");
    }
  } catch (err) {
    console.error("Error fetching page:", err);
  }
}

test();
