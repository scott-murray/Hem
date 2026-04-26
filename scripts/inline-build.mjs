/**
 * Post-build step: inline every <script src="..."> referenced by dist/index.html
 * into the HTML so the result is a single self-contained file at docs/index.html.
 *
 * Usage: node scripts/inline-build.mjs
 *
 * Why a separate output dir: Vite owns dist/, and we want the committed
 * playable artefact (docs/index.html) to be obviously a build product.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const distDir = resolve('dist');
const outDir = resolve('docs');
const htmlPath = resolve(distDir, 'index.html');

if (!existsSync(htmlPath)) {
  console.error('dist/index.html not found — run `npm run build` first.');
  process.exit(1);
}

let html = readFileSync(htmlPath, 'utf8');

const scriptRe = /<script\b([^>]*)\bsrc="(?:\.?\/)?([^"]+)"([^>]*)><\/script>/g;
let count = 0;
html = html.replace(scriptRe, (_, before, srcPath, after) => {
  const jsPath = resolve(distDir, srcPath);
  if (!existsSync(jsPath)) {
    throw new Error(`Referenced asset missing: ${jsPath}`);
  }
  const js = readFileSync(jsPath, 'utf8');
  const attrs = `${before}${after}`.trim();
  count++;
  return `<script ${attrs}>${js}\n</script>`;
});

mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'index.html');
writeFileSync(outPath, html);

const sizeKb = (html.length / 1024).toFixed(1);
console.log(`Inlined ${count} script(s) → ${outPath} (${sizeKb} KB)`);
