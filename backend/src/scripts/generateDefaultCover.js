import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const COVER_IMAGES_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'cover-images');

// Create cover-images directory if it doesn't exist
if (!fs.existsSync(COVER_IMAGES_DIR)) {
    fs.mkdirSync(COVER_IMAGES_DIR, { recursive: true });
}

// Create a 500x500 canvas
const canvas = createCanvas(500, 500);
const ctx = canvas.getContext('2d');

// Fill background with a gradient
const gradient = ctx.createLinearGradient(0, 0, 500, 500);
gradient.addColorStop(0, '#1DB954'); // Spotify green
gradient.addColorStop(1, '#191414'); // Spotify black
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 500, 500);

// Add a music note icon
ctx.fillStyle = 'white';
ctx.font = 'bold 200px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('♪', 250, 250);

// Save the image
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync(path.join(COVER_IMAGES_DIR, 'default.jpg'), buffer);

console.log('Default cover image generated successfully'); 