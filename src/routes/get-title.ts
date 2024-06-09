import express from "express";
import ytdl from "ytdl-core";
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const videoUrl = req.body.link;
        if (!ytdl.validateURL(videoUrl)) return res.status(400).json({ success: false, error: "Invalid URL" });

        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;

        res.status(200).json({ success: true, title });
    } catch (error) {
        console.error("Error validating URL:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;
