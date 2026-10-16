import { Buffer } from 'node:buffer';
import {readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
// Preserve the original brand pixels; SVG's viewport isolates the crest from the banner.
const banner=await readFile('public/images/brand-banner.jpeg');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="355" height="355" viewBox="100 145 355 355"><title>Shree Sudhya SS brand emblem</title><image width="1600" height="640" href="data:image/jpeg;base64,${banner.toString('base64')}"/></svg>\n`;
await writeFile('src/app/icon.svg',svg);
const sizes=[16,32,48,64];
const images=await Promise.all(sizes.map(size=>sharp(Buffer.from(svg)).resize(size,size).png().toBuffer()));
const directory=Buffer.alloc(6+16*sizes.length);
directory.writeUInt16LE(1,2);directory.writeUInt16LE(sizes.length,4);
let offset=directory.length;
images.forEach((png,i)=>{const entry=6+16*i;directory[entry]=sizes[i];directory[entry+1]=sizes[i];directory.writeUInt16LE(1,entry+4);directory.writeUInt16LE(32,entry+6);directory.writeUInt32LE(png.length,entry+8);directory.writeUInt32LE(offset,entry+12);offset+=png.length;});
await writeFile('src/app/favicon.ico',Buffer.concat([directory,...images]));
await sharp(Buffer.from(svg)).resize(180,180).png().toFile('src/app/apple-icon.png');
await sharp(Buffer.from(svg)).resize(128,128).png().toFile('design/favicon-brand-preview.png');
console.log('Original SS emblem installed in SVG, four-size ICO and Apple touch icon.');
