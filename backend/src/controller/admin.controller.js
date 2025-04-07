import {Song} from "../models/song.model.js"
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";


const uploadToCloudinary = async (file) => {
    try{
        const result =await cloudinary.uploader.upload(file.tempFilePath, {
            resource_type: "auto"
        })
        return result.secure_url;
    }
    catch(error){
        console.error("Error in uploading to cloudinary",error);
        throw new Error("Error in uploading to cloudinary");
    }
}


export const createSong = async(req, res,next) => {
    try {
        if(!req.files || !req.files.audioFile || !req.files.imageFile){
            return res.status(400).json({ message: "Please upload both audio and image files" });
        }

        const { title, artist, albumId, duration } = req.body;
        if(!title || !artist || !duration){
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const audioFile = req.files.audioFile;
        const imageFile = req.files.imageFile;
        
        // Validate file types
        const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        
        if (!allowedAudioTypes.includes(audioFile.mimetype)) {
            return res.status(400).json({ 
                message: "Invalid audio file type. Please upload MP3, WAV, or OGG files." 
            });
        }
        
        if (!allowedImageTypes.includes(imageFile.mimetype)) {
            return res.status(400).json({ 
                message: "Invalid image file type. Please upload JPEG, JPG, or PNG images." 
            });
        }

        // Validate file sizes
        const maxAudioSize = 50 * 1024 * 1024; // 50MB
        const maxImageSize = 10 * 1024 * 1024; // 10MB for Cloudinary free tier
        
        if (audioFile.size > maxAudioSize) {
            return res.status(400).json({ 
                message: "Audio file is too large. Maximum size is 50MB." 
            });
        }
        if (imageFile.size > maxImageSize) {
            return res.status(400).json({ 
                message: "Image file is too large. Maximum size is 10MB for Cloudinary free tier. Please compress the image before uploading." 
            });
        }

        const audioUrl = await uploadToCloudinary(audioFile);
        const imageUrl = await uploadToCloudinary(imageFile);

        const song = new Song({
            title,
            artist,
            albumId: albumId || null,
            duration,
            audioUrl,
            imageUrl
        });

        await song.save();

        if(albumId){
            await Album.findByIdAndUpdate(albumId, {
                $push: { songs: song._id },
            });
        }

        res.status(201).json({ 
            message: "Song created successfully",
            song: {
                _id: song._id,
                title: song.title,
                artist: song.artist,
                albumId: song.albumId,
                duration: song.duration,
                audioUrl: song.audioUrl,
                imageUrl: song.imageUrl
            }
        });
    }
    catch(error){
        res.status(500).json({ 
            message: error.message || "Error creating song",
            error: error.message 
        });
    }
}

export const deleteSong = async(req, res,next) => {
    try{
        const { id } = req.params;
        const song = await Song.findById(id);
        if(song.albumId){
            await Album.findByIdAndUpdate(song.albumId, {
                $pull: { songs: id },
            });
        }
        await Song.findByIdAndDelete(id);
        res.status(200).json({ message: "Song deleted successfully" });
    }
    catch(error){
        console.error("Error in deleting song",error);
        next(error);
    }
}


export const createAlbum = async(req, res,next) => {
    try {
        if(!req.files || !req.files.imageFile){
            return res.status(400).json({ message: "Please upload an image" });
        }

        const { title, artist, releaseYear } = req.body;
        if(!title || !artist || !releaseYear){
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const imageFile = req.files.imageFile;
        
        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedImageTypes.includes(imageFile.mimetype)) {
            return res.status(400).json({ 
                message: "Invalid image file type. Please upload JPEG, JPG, or PNG images." 
            });
        }

        // Validate file size
        const maxImageSize = 10 * 1024 * 1024; // 10MB for Cloudinary free tier
        if (imageFile.size > maxImageSize) {
            return res.status(400).json({ 
                message: "Image file is too large. Maximum size is 10MB for Cloudinary free tier. Please compress the image before uploading." 
            });
        }

        const imageUrl = await uploadToCloudinary(imageFile);

        const album = new Album({
            title,
            artist,
            releaseYear: parseInt(releaseYear),
            imageUrl,
            songs: []
        });

        await album.save();

        res.status(201).json({ 
            message: "Album created successfully",
            album: {
                _id: album._id,
                title: album.title,
                artist: album.artist,
                releaseYear: album.releaseYear,
                imageUrl: album.imageUrl,
                songs: album.songs
            }
        });
    }
    catch(error){
        res.status(500).json({ 
            message: error.message || "Error creating album",
            error: error.message 
        });
    }
}

export const deleteAlbum = async(req, res,next) => {
    try{
        const {id} = req.params;
        await Song.deleteMany({albumId:id});
        await Album.findByIdAndDelete(id);
        res.status(200).json({ message: "Album deleted successfully" });
    }
    catch(error){
        console.error("Error in deleting album",error);
        next(error);
    }
}


export const checkAdmin = async(req, res,next) => {
    res.status(200).json({ admin: true });
    console.log("Admin check successful")
}