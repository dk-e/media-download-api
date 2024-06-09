import express from "express";
import ytdl from "ytdl-core";
import ffmpeg from "ffmpeg";
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const videoUrl = req.body.link;

        if (!ytdl.validateURL(videoUrl)) {
            return res.status(500).json({ error: "Invalid URL" });
        }

        const videoInfo = await ytdl.getInfo(videoUrl);
        const title = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, ""); // Remove special characters
        const tempDir = path.join(__dirname, "temp");

        await fsPromises.mkdir(tempDir, { recursive: true });

        const videoFilePath = path.join(tempDir, `${title}.mp4`);
        const audioFilePath = path.join(tempDir, `${title}.mp3`);
        const combinedFilePath = path.join(tempDir, `${title}_combined.mp4`);

        const videoReadableStream = ytdl(videoUrl, { quality: "highestvideo" });

        videoReadableStream.pipe(fs.createWriteStream(videoFilePath));

        videoReadableStream.on("end", async () => {
            try {
                const audioReadableStream = ytdl(videoUrl, { quality: "highestaudio" });
                audioReadableStream.pipe(fs.createWriteStream(audioFilePath));

                audioReadableStream.on("end", async () => {
                    try {
                        ffmpeg(videoFilePath)
                            .input(audioFilePath)
                            .outputOptions("-c:v copy")
                            .outputOptions("-c:a aac")
                            .save(combinedFilePath)
                            .on("end", () => {
                                res.download(combinedFilePath, `${title}.mp4`, async () => {
                                    // Cleanup temp files
                                    await Promise.all([fsPromises.unlink(videoFilePath), fsPromises.unlink(audioFilePath), fsPromises.unlink(combinedFilePath)]);
                                });
                            })
                            .on("error", (err) => {
                                console.error("Error combining audio and video:", err);
                                res.status(500).json({
                                    success: false,
                                    message: "Error combining audio and video",
                                });
                            });
                    } catch (error) {
                        console.error("Error combining audio and video:", error);
                        res.status(500).json({
                            success: false,
                            message: "Error combining audio and video",
                        });
                    }
                });

                audioReadableStream.on("error", (error) => {
                    console.error("Error downloading audio:", error);
                    res.status(500).json({
                        success: false,
                        message: "Error downloading audio",
                    });
                });
            } catch (error) {
                console.error("Error downloading audio:", error);
                res.status(500).json({
                    success: false,
                    message: "Error downloading audio",
                });
            }
        });

        videoReadableStream.on("error", (error) => {
            console.error("Error downloading video:", error);
            res.status(500).json({
                success: false,
                message: "Error downloading video",
            });
        });
    } catch (error) {
        console.error("Error downloading video:", error);
        res.status(500).json({
            success: false,
            message: "Error downloading video",
        });
    }
});

export default router;
