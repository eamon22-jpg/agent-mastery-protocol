import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = fileURLToPath(new URL('../dist/client/', import.meta.url));
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isProjectPage = repositoryName !== '' && !repositoryName.endsWith('.github.io');
const basePath = isProjectPage ? `/${repositoryName}` : '';
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.rsc', '.txt']);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

if (basePath !== '') {
  const files = await listFiles(outputDirectory);

  for (const file of files) {
    if (!textExtensions.has(extname(file))) continue;

    const source = await readFile(file, 'utf8');
    const updated = source
      .replaceAll('"/_next/', `"${basePath}/_next/`)
      .replaceAll("'/_next/", `'${basePath}/_next/`)
      .replaceAll('url(/_next/', `url(${basePath}/_next/`);

    if (updated !== source) await writeFile(file, updated);
  }
}

console.log(`Prepared GitHub Pages output for base path: ${basePath || '/'}`);
