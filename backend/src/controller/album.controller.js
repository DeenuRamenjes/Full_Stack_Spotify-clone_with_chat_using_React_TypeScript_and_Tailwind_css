import {Album} from "../models/album.model.js";


export const getAllAlbum = async(req, res, next) => {
    try{
        const albums = await Album.find({});
        res.status(200).json(albums);
    }
    catch (error) {
        console.error("Error fetching albums:", error);
        next(error);
    }
}

export const getAlbumById = async(req, res, next) => {
    try{
        const {id} = req.params;
        const album = await Album.findById(id).populate("songs");
        if(!album) {
            return res.status(404).json({message:"Album not found"});
        }
        res.status(200).json(album);
    }
    catch (error) {
        console.error("Error fetching album by id:", error);
        next(error);
    }
}