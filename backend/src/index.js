import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import { clerkMiddleware } from '@clerk/express'
import fileUpload from 'express-fileupload';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocket } from './lib/socket.js';
import cron from 'node-cron';
import fs from 'fs';

const __dirname = path.resolve();

dotenv.config();
const app = express();

const httpServer=createServer(app);
initializeSocket(httpServer);

app.use(cors(
    {
        origin: ['http://localhost:3000'],
        credentials: true
    }
));


app.use(express.json());
app.use(clerkMiddleware())
app.use(fileUpload({
    useTempFiles: true,
    useFileDir:path.join(__dirname, 'temp'),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}));

//delete temp files automatically
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	if (fs.existsSync(tempDir)) {
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("error", err);
				return;
			}
			for (const file of files) {
				fs.unlink(path.join(tempDir, file), (err) => {});
			}
		});
	}
});

//Routes
import userRoute from './routes/user.route.js';
import authRoute from './routes/auth.route.js';
import adminRoute from './routes/admin.route.js';
import songsRoute from './routes/songs.route.js';
import albumRoute from './routes/album.route.js';
import statsRoute from './routes/stats.route.js';





app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/songs', songsRoute);
app.use('/api/album', albumRoute);
app.use('/api/stats', statsRoute);


if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname, "../frontend","dist","index.html"));
    })
}




//error handling middleware
app.use((err, req, res, next) => {
    console.error("Error in middleware", err.message);
    res.status(500).json({ 
        message:process.env.NODE_ENV === 'production' ? "Internal Server Error" : err.message,
    });
})





const PORT= process.env.PORT


httpServer.listen(PORT, () => {
    console.log('================================');
    console.log(`Server is running on Port ${PORT}`);
    console.log('================================');
    connectDB();
})