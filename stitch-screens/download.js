const fs = require('fs');
const https = require('https');

const urls = {
  'screen1.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU2N2UxOWU0ZDAyNzQ5MjY4N2Q2ODVlMjFjYTIzNzdmEgsSBxCV2uOLnBoYAZIBIwoKcHJvamVjdF9pZBIVQhM0OTMyNDE1NzI0NjMyNTk2NDY4&filename=&opi=89354086',
  'screen2.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzJjZTkyMGJmZDE2ZDRkYmNhMGNkMWQ2ODcyMzgxNGM0EgsSBxCV2uOLnBoYAZIBIwoKcHJvamVjdF9pZBIVQhM0OTMyNDE1NzI0NjMyNTk2NDY4&filename=&opi=89354086',
  'screen3.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzFiM2JkZmNkNjUxYjQzOThhY2U0MDE1NzJlZWNlYzg2EgsSBxCV2uOLnBoYAZIBIwoKcHJvamVjdF9pZBIVQhM0OTMyNDE1NzI0NjMyNTk2NDY4&filename=&opi=89354086',
  'screen4.html': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2QyYzRmMTNjY2Y3YjRiMjA4YThlZDMzNDc5MmI4ZTRlEgsSBxCV2uOLnBoYAZIBIwoKcHJvamVjdF9pZBIVQhM0OTMyNDE1NzI0NjMyNTk2NDY4&filename=&opi=89354086'
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const [filename, url] of Object.entries(urls)) {
    console.log(`Downloading ${filename}...`);
    try {
      await download(url, `stitch-screens/${filename}`);
      console.log(`Downloaded ${filename}`);
    } catch (err) {
      console.error(`Error downloading ${filename}:`, err);
    }
  }
}

run();
