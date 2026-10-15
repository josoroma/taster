import { cp, mkdir, readFile, writeFile, rm, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
await rm(dist, { recursive:true, force:true });
await mkdir(dist, { recursive:true });
await access(resolve(root,'index.html'));
// Optional files keep generated single-example projects independent of the showcase.
// Include every available translation, such as README-ES.md or README-PT-BR.md.
const readmes = (await readdir(root, { withFileTypes:true }))
  .filter(entry => entry.isFile() && /^README(?:-[a-z0-9]+)*\.md$/i.test(entry.name))
  .map(entry => entry.name);
for (const path of ['index.html', 'favicon.svg', 'LICENSE', ...readmes, 'assets', 'kit', 'examples']) {
  try { await access(resolve(root,path)); } catch { continue; }
  await cp(resolve(root, path), resolve(dist, path), { recursive:true });
}
// This is already-built static content, including ES modules and CAD exports.
await writeFile(resolve(dist, '.nojekyll'), '');
await mkdir(resolve(dist, 'scripts'), { recursive:true });
await cp(resolve(root, 'scripts/BROWSER-HELPERS-LICENSE'), resolve(dist, 'scripts/BROWSER-HELPERS-LICENSE'));
async function rewriteHtml(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=resolve(directory,entry.name);
    if(entry.isDirectory())await rewriteHtml(file);
    else if(entry.name.endsWith('.html')){
      const html=await readFile(file,'utf8');
      await writeFile(file,html.replaceAll('node_modules/three/build/','vendor/three/').replaceAll('node_modules/three/examples/jsm/','vendor/three/addons/'));
    }
  }
}
await rewriteHtml(dist);
await cp(resolve(root, 'node_modules/three/build'), resolve(dist, 'vendor/three'), { recursive:true });
await cp(resolve(root, 'node_modules/three/examples/jsm'), resolve(dist, 'vendor/three/addons'), { recursive:true });
await cp(resolve(root, 'node_modules/three/LICENSE'), resolve(dist, 'vendor/three/LICENSE'));
console.log('Built dist/ — self-contained static experiences; serve over HTTP.');
