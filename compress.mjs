import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const BACKUP_DIR = path.join(ROOT, 'images_backup');

const JPEG_QUALITY = 78;
const PNG_COMPRESSION = 9;
const MAX_DIMENSION = 2000;

const FILES = [
  'logo.png',
  'gimbal.png',
  'videocamera.png',
  'sliki/sliki-1.jpg',
  'sliki/sliki-2.jpg',
  'sliki/sliki-3.jpg',
  'sliki/sliki-4.jpg',
  'sliki/sliki-5.jpg',
  'sliki/sliki-6.jpg',
  'sliki/sliki-7.jpg',
  'nastani/nastani-1.jpg',
  'nastani/nastani-2.jpg',
  'nastani/nastani-3.jpg',
  'nastani/nastani-4.jpg',
  'nastani/nastani-5.jpg',
  'nastani/nastani-6.jpg',
  'nastani/nastani-7.jpg',
  'promocija/promo-1.jpg',
  'promocija/promo-2.jpg',
  'promocija/promo-3.jpg',
  'promocija/promo-4.jpg',
  'promocija/promo-5.jpg',
  'promocija/promo-6.jpg',
  'promocija/promo-7.jpg',
  'sport/sport-1.jpg',
  'sport/sport-2.jpg',
  'sport/sport-3.jpg',
  'sport/sport-4.jpg',
  'sport/sport-5.jpg',
  'sport/sport-6.jpg',
  'sport/sport-7.jpg',
];

function ensureBackupDir(relativePath) {
  const subdir = path.dirname(relativePath);
  const backupSubdir = path.join(BACKUP_DIR, subdir);
  if (!fs.existsSync(backupSubdir)) {
    fs.mkdirSync(backupSubdir, { recursive: true });
  }
}

function backup(relativePath) {
  const src = path.join(ROOT, relativePath);
  const dest = path.join(BACKUP_DIR, relativePath);
  ensureBackupDir(relativePath);
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
  }
}

async function compress(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  const ext = path.extname(relativePath).toLowerCase();
  const sizeBefore = fs.statSync(fullPath).size;

  const meta = await sharp(fullPath).metadata();
  const { width, height } = meta;
  const longest = Math.max(width, height);

  let pipeline = sharp(fullPath);

  if (longest > MAX_DIMENSION) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_DIMENSION : null,
      height: height > width ? MAX_DIMENSION : null,
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true,
      chromaSubsampling: '4:2:0',
    });
  } else if (ext === '.png') {
    pipeline = pipeline.png({
      compressionLevel: PNG_COMPRESSION,
      adaptiveFiltering: true,
      palette: false,
    });
  }

  const tmpPath = fullPath + '.tmp';
  await pipeline.toFile(tmpPath);

  const sizeAfter = fs.statSync(tmpPath).size;

  if (sizeAfter < sizeBefore) {
    fs.renameSync(tmpPath, fullPath);
    const saved = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);
    const beforeKB = (sizeBefore / 1024).toFixed(0);
    const afterKB = (sizeAfter / 1024).toFixed(0);
    console.log(`  ${relativePath.padEnd(32)} ${beforeKB.padStart(7)}KB -> ${afterKB.padStart(7)}KB  (-${saved}%)`);
    return { before: sizeBefore, after: sizeAfter };
  } else {
    fs.unlinkSync(tmpPath);
    console.log(`  ${relativePath.padEnd(32)} ${(sizeBefore/1024).toFixed(0).padStart(7)}KB  (already optimal)`);
    return { before: sizeBefore, after: sizeBefore };
  }
}

async function main() {
  console.log('=== Backing up originals to images_backup/ ===');
  for (const f of FILES) backup(f);
  console.log('Done.\n');

  console.log('=== Compressing images ===');
  let totalBefore = 0;
  let totalAfter = 0;

  for (const f of FILES) {
    const { before, after } = await compress(f);
    totalBefore += before;
    totalAfter += after;
  }

  const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
  const pct = ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1);
  console.log(`\n=== Summary ===`);
  console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(1)} MB`);
  console.log(`After:  ${(totalAfter / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Saved:  ${savedMB} MB  (-${pct}%)`);
}

main().catch(err => { console.error(err); process.exit(1); });
