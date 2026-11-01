import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
// Retain the original wordmark; use a consistent paper tile so the icon works in dark tabs too.
const mark = await sharp('public/images/rayanesh-mark.png').trim().png().toBuffer();
async function tile(size) {
  const width = Math.round(size * .9);
  const logo = await sharp(mark).resize({ width }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#f4f0e7' } }).composite([{ input: logo, gravity: 'centre' }]).png().toBuffer();
}
for (const [size, path] of [[96, 'public/favicon-96.png'], [180, 'public/apple-touch-icon.png'], [512, 'public/images/site-logo.png']]) await writeFile(path, await tile(size));
const images = await Promise.all([32, 48].map(tile));
const header = Buffer.alloc(6 + images.length * 16);
header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
let offset = header.length;
images.forEach((buffer, i) => {
  const at = 6 + i * 16, size = [32, 48][i];
  header[at] = size; header[at + 1] = size;
  header.writeUInt16LE(1, at + 4); header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(buffer.length, at + 8); header.writeUInt32LE(offset, at + 12); offset += buffer.length;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...images]));
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f4f0e7' } }).composite([{ input: await sharp(mark).resize({ width: 800 }).png().toBuffer(), gravity: 'centre' }]).png().toFile('public/images/social-card.png');
console.log('Generated favicon, Apple touch icon, publisher logo and social card.');
