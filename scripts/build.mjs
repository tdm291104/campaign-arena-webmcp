import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { transform } from 'esbuild';

const source = await readFile('index.html', 'utf8');
const match = source.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (!match) throw new Error('Expected one text/babel source script in index.html');

const { code } = await transform(match[1], {
  loader: 'jsx',
  minify: true,
  target: 'es2020',
});
const html = source
  .replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/babel-standalone\/[^\n]+<\/script>\n?/, '')
  .replace(match[0], `<script>${code}</script>`);

if (html.includes('text/babel') || html.includes('babel-standalone')) {
  throw new Error('Runtime Babel remained in the production document');
}

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html);
await cp('assets', 'dist/assets', { recursive: true });

console.log('Built dist/index.html without runtime Babel.');
