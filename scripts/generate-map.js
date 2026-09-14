const fs = require('fs');
const path = require('path');

const registryData = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps/docs/public/r/registry.json'), 'utf-8'));
const items = registryData.items;

let md = '# Void UI / Adgrid UI — Component Architecture & Linkage Map\n\n';
md += '> **Primary Source of Truth**: `apps/docs/src/registry/index.ts`  \n';
md += '> **Total Registered Components**: ' + items.length + '  \n';
md += '> **Generated**: ' + new Date().toISOString().split('T')[0] + '\n\n';
md += '---\n\n';
md += '## 1. Monorepo Architecture & The 5-Point Component Linkage\n\n';
md += 'Whenever editing, debugging, or adding any component in this monorepo, 5 key touchpoints are linked together:\n\n';
md += '| Touchpoint | Purpose | Path Pattern |\n';
md += '| :--- | :--- | :--- |\n';
md += '| **1. UI Source File** | Actual React component logic, styles, animations | `packages/ui/src/<packagePath>` |\n';
md += '| **2. Monorepo Barrel Export** | Re-exported for `@adgrid-ui/ui` monorepo consumers | `packages/ui/src/index.ts` |\n';
md += '| **3. Docs Registry Source** | Metadata, slug, category, propDefs (tweaker controls), dependencies | `apps/docs/src/registry/index.ts` |\n';
md += '| **4. Showcase / Presentation** | Live renderer in Gallery and `/present/[category]/[slug]` studio | `apps/docs/src/components/presentation/PresentationRenderer.tsx` |\n';
md += '| **5. CLI / Shadcn Distribution** | Precompiled static JSON schema consumed by `npx void-ui add <slug>` | `apps/docs/public/r/<slug>.json` |\n\n';
md += '---\n\n';
md += '## 2. Complete Component Index (' + items.length + ' Components)\n\n';
md += '| # | Component Name | Slug | Pure Source Path | Key Dependencies |\n';
md += '| :--- | :--- | :--- | :--- | :--- |\n';

const UI_SRC = path.join(__dirname, '../packages/ui/src');

items.forEach((item, idx) => {
  const deps = item.dependencies && item.dependencies.length > 0
    ? item.dependencies.map(d => '`' + d + '`').join(', ')
    : 'None';
  
  // Find matching file in packages/ui/src
  let relPath = '';
  if (item.files && item.files.length > 0) {
    const firstFile = item.files[0].path; // e.g. components/ui/InfiniteScroll.tsx or components/ui/wheel-picker/...
    const baseName = path.basename(firstFile);
    
    // Check animated/
    if (fs.existsSync(path.join(UI_SRC, 'animated', baseName))) {
      relPath = 'packages/ui/src/animated/' + baseName;
    } else if (fs.existsSync(path.join(UI_SRC, 'backgrounds', baseName))) {
      relPath = 'packages/ui/src/backgrounds/' + baseName;
    } else {
      // Look recursively in animated/
      const findFile = (dir) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            const found = findFile(full);
            if (found) return found;
          } else if (e.name === baseName) {
            return full;
          }
        }
        return null;
      };
      const found = findFile(path.join(UI_SRC, 'animated')) || findFile(path.join(UI_SRC, 'backgrounds'));
      if (found) {
        relPath = path.relative(path.join(__dirname, '..'), found).replace(/\\/g, '/');
      } else {
        relPath = 'packages/ui/src/' + baseName;
      }
    }
  }

  const fileUrl = `file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/${relPath}`;
  md += `| ${idx + 1} | **${item.title}** | \`${item.name}\` | [\`${relPath}\`](${fileUrl}) | ${deps} |\n`;
});

md += '\n---\n\n';
md += '## 3. Core App & Package Entry Points\n\n';
md += '| Subsystem | Pure Path | Role |\n';
md += '| :--- | :--- | :--- |\n';
md += '| **UI Barrel** | [`packages/ui/src/index.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/src/index.ts) | Exports all 62 components for monorepo consumers |\n';
md += '| **UI Package Styles** | [`packages/ui/styles/globals.css`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/packages/ui/styles/globals.css) | Standalone package styles and font imports |\n';
md += '| **Registry Source** | [`apps/docs/src/registry/index.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/registry/index.ts) | Component catalog, schemas, and live prop definitions |\n';
md += '| **Registry Builder** | [`apps/docs/scripts/build-registry.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/scripts/build-registry.ts) | Precompiles static registry JSON files to `apps/docs/public/r/` |\n';
md += '| **Registry API** | [`apps/docs/src/app/api/registry/[slug]/route.ts`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/api/registry/[slug]/route.ts) | On-demand dynamic JSON API for CLI/docs consumption |\n';
md += '| **Presentation Studio** | [`apps/docs/src/components/presentation/PresentationRenderer.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/components/presentation/PresentationRenderer.tsx) | Renders live components inside the interactive presentation studio |\n';
md += '| **Docs Gallery** | [`apps/docs/src/app/gallery/page.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/gallery/page.tsx) | Main grid gallery rendering cards and widgets |\n';
md += '| **Sandpack Live Preview** | [`apps/docs/src/components/site/LivePreview.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/components/site/LivePreview.tsx) | Interactive in-browser Sandpack preview & code editor |\n';
md += '| **Docs Global Styles** | [`apps/docs/src/app/globals.css`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/globals.css) | Global Tailwind 4 theme, font imports, and scrollbar styling |\n';
md += '| **Root Layout** | [`apps/docs/src/app/layout.tsx`](file:///C:/Users/ajink/OneDrive/Desktop/personal%20-%20coding%20-%20ventures/adgrid-ui/adgrid-ui/apps/docs/src/app/layout.tsx) | Next.js root layout, base HTML chrome, font providers |\n';

fs.writeFileSync(path.join(__dirname, '../COMPONENT_MAP.md'), md, 'utf-8');
console.log('Successfully generated COMPONENT_MAP.md with ' + items.length + ' components.');
