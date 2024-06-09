import express from "express";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const videoUrl = req.body.link;

        if (!ytdl.validateURL(videoUrl)) return res.status(400).json({ error: "Invalid URL" });

        const options: ytdl.downloadOptions = {
            quality: "highestaudio",
            filter: "audioonly",
        };

        const info = await ytdl.getInfo(videoUrl);
        console.log(info);

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, ""); // Remove special characters
        const tempDir = path.join(process.cwd(), "temp");

        await fsPromises.mkdir(tempDir, { recursive: true });

        const audioPath = path.join(tempDir, `${encodeURI(title)}.mp3`);
        console.log(audioPath);

        const audioWriteStream = fs.createWriteStream(audioPath);
        ytdl(videoUrl, options).pipe(audioWriteStream);

        audioWriteStream.on("finish", () => {
            res.download(audioPath, `${title}.mp3`, async () => {
                await fsPromises.unlink(audioPath);
            });
        });

        audioWriteStream.on("error", (error) => {
            console.error("Error writing audio file:", error);
            res.status(500).json({
                success: false,
                message: "Error writing audio file",
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error - please contact an admin",
        });
    }
});

export default router;
