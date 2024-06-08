import express from "express";
import ytdl from "ytdl-core";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const videoUrl = req.body.link;
    if (!ytdl.validateURL)
      return res.status(500).json({ success: "false", error: "Invalid URL" });

    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title;

    res.status(200).json({ success: "true", message: title });
  } catch (error) {
    console.log(error);
  }
});

export default router;
