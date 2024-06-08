import express from "express";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const videoUrl = req.body.link;

        if (!ytdl.validateURL(videoUrl)) {
            return res.status(500).json({ error: "Invalid URL" });
        }

        const videoInfo = await ytdl.getInfo(videoUrl);
        const title = videoInfo.videoDetails.title;

        // Download highest quality video
        const videoReadableStream = ytdl(videoUrl, { quality: "highestvideo" });
        const videoFilePath = path.join(__dirname, "temp", `${title}.mp4`);

        videoReadableStream.pipe(fs.createWriteStream(videoFilePath));

        videoReadableStream.on("end", async () => {
            try {
                // Extract highest quality audio
                const audioReadableStream = ytdl(videoUrl, { quality: "highestaudio" });
                const audioFilePath = path.join(__dirname, "temp", `${title}.mp3`);
                audioReadableStream.pipe(fs.createWriteStream(audioFilePath));

                audioReadableStream.on("end", async () => {
                    try {
                        // Combine audio and video
                        const combinedFilePath = path.join(__dirname, "temp", `${title}_combined.mp4`);
                        ffmpeg(videoFilePath).input(audioFilePath).outputOptions("-c:v copy").outputOptions("-c:a aac").save(combinedFilePath);

                        // Send combined file as response
                        res.download(combinedFilePath, `${title}.mp4`, () => {
                            // Cleanup temp files
                            fs.unlinkSync(videoFilePath);
                            fs.unlinkSync(audioFilePath);
                            fs.unlinkSync(combinedFilePath);
                        });
                    } catch (error) {
                        console.error("Error combining audio and video:", error);
                        res.status(500).json({
                            success: false,
                            message: "error combining audio and video",
                        });
                    }
                });
            } catch (error) {
                console.error("Error downloading audio:", error);
                res.status(500).json({
                    success: false,
                    message: "error downloading audio",
                });
            }
        });
    } catch (error) {
        console.error("Error downloading video:", error);
        res.status(500).json({
            success: false,
            message: "error downloading video",
        });
    }
});

export default router;
