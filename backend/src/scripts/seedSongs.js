import mongoose from 'mongoose';
import { Song } from '../models/song.model.js';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { parseFile } from 'music-metadata';

config();

const SONGS_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'songs');
const COVER_IMAGES_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'cover-images');

const getDuration = async (filePath) => {
    try {
        const metadata = await parseFile(filePath);
        return Math.floor(metadata.format.duration || 180); // Default to 3 minutes if duration not found
    } catch (error) {
        console.error(`Error getting duration for ${filePath}:`, error);
        return 180; // Default to 3 minutes on error
    }
};

const seedSongs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing songs
        await Song.deleteMany({});
        console.log('Cleared existing songs');

        // Get all MP3 files from the songs directory
        const files = fs.readdirSync(SONGS_DIR);
        const mp3Files = files.filter(file => file.endsWith('.mp3'));

        // Create song objects
        const songs = await Promise.all(mp3Files.map(async file => {
            const filePath = path.join(SONGS_DIR, file);
            const duration = await getDuration(filePath);

            const title = file
                .replace(/(256k|128k)\.mp3$/, '') // Remove bitrate
                .replace(/_/g, ' ') // Replace underscores with spaces
                .replace(/\([^)]*\)/g, '') // Remove text in parentheses
                .replace(/\[[^\]]*\]/g, '') // Remove text in brackets
                .trim();

            // Extract artist if present in filename (assuming format "Artist - Title")
            let artist = 'Unknown Artist';
            let songTitle = title;
            if (title.includes('-')) {
                const parts = title.split('-');
                artist = parts[0].trim();
                songTitle = parts[1].trim();
            }

            return {
                title: songTitle,
                artist,
                audioUrl: `/songs/${file}`,
                imageUrl: '/cover-images/default.jpg', // Default cover image
                duration
            };
        }));

        // Insert songs into database
        await Song.insertMany(songs);
        console.log(`Successfully seeded ${songs.length} songs`);

    } catch (error) {
        console.error('Error seeding songs:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
};

seedSongs(); 