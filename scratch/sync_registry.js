const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../packages/ui/src/animated/ImageReveal.tsx');
const rJsonPath = path.join(__dirname, '../apps/docs/public/r/image-reveal.json');
const regJsonPath = path.join(__dirname, '../apps/docs/public/registry/image-reveal.json');
const regIdxJsonPath = path.join(__dirname, '../apps/docs/public/registry/index.json');

if (fs.existsSync(srcPath)) {
  const codeContent = fs.readFileSync(srcPath, 'utf-8');
  
  if (fs.existsSync(rJsonPath)) {
    const json = JSON.parse(fs.readFileSync(rJsonPath, 'utf-8'));
    if (json.files && json.files[0]) {
      json.files[0].content = codeContent;
      fs.writeFileSync(rJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
    }
  }

  if (fs.existsSync(regJsonPath)) {
    const json = JSON.parse(fs.readFileSync(regJsonPath, 'utf-8'));
    json.code = codeContent;
    fs.writeFileSync(regJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  }

  if (fs.existsSync(regIdxJsonPath)) {
    const json = JSON.parse(fs.readFileSync(regIdxJsonPath, 'utf-8'));
    if (json['image-reveal']) {
      json['image-reveal'].code = codeContent;
      fs.writeFileSync(regIdxJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
    }
  }

  console.log('Synced all registry files successfully.');
}
