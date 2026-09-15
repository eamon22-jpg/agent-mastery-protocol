import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = fileURLToPath(new URL('../dist/client/', import.meta.url));
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isProjectPage = repositoryName !== '' && !repositoryName.endsWith('.github.io');
const basePath = isProjectPage ? `/${repositoryName}` : '';
const indexPath = join(outputDirectory, 'index.html');
const index = await readFile(indexPath, 'utf8');
const assetPaths = [...index.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => path.includes('/_next/'));

if (assetPaths.length === 0) {
  throw new Error('The page does not reference any built assets.');
}

for (const assetPath of new Set(assetPaths)) {
  if (!assetPath.startsWith(`${basePath}/_next/`)) {
    throw new Error(`Incorrect GitHub Pages asset path: ${assetPath}`);
  }

  const localPath = assetPath.slice(basePath.length + 1);
  await access(join(outputDirectory, localPath));
}

await access(join(outputDirectory, '.nojekyll'));
console.log(`Verified ${new Set(assetPaths).size} GitHub Pages assets.`);
