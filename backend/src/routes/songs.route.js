import { Router } from "express";
import { getAllSong, getMadeForYouSong, getTreandingSong, getFeaturedSong, } from "../controller/song.controller.js";
import { protectRoute,requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/",protectRoute,requireAdmin,getAllSong)
router.get("/featured",getFeaturedSong)
router.get("/made-for-you",getMadeForYouSong)
router.get("/trending",getTreandingSong)


export default router;