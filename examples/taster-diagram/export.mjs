// Regenerate the standalone, full-diagram SVG without a browser or network.
import { readFile,writeFile } from 'node:fs/promises';
import { exportSVG } from './src/diagram.mjs';

const fonts = [
  ['DM Sans','dm-sans-400.ttf',400],['DM Sans','dm-sans-500.ttf',500],
  ['DM Sans','dm-sans-600.ttf',600],['Italiana','italiana.ttf',400],
];
const styles = await Promise.all(fonts.map(async ([family,file,weight]) => {
  const data = await readFile(new URL(`../../assets/fonts/${file}`,import.meta.url));
  return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${data.toString('base64')}) format('truetype');}`;
}));
const output = new URL('./taster-workflow.svg',import.meta.url);
await writeFile(output,exportSVG('all',styles.join('')));
console.log(`Wrote ${output.pathname}`);
