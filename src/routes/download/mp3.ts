import express from "express";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const videoUrl = req.body.link;

    if (!ytdl.validateURL(videoUrl))
      return res.status(500).json({ error: "Invalid URL" });

    const options: ytdl.downloadOptions = {
      quality: "highestaudio",
      filter: "audioonly",
    };

    const info = await ytdl.getInfo(videoUrl);
    console.log(info);

    const title = info.videoDetails.title;

    const videoPath = path.join(
      process.cwd(),
      "temp",
      `${encodeURI(title)}.mp4`
    );
    console.log(videoPath);

    const videoWriteStream = fs.createWriteStream(videoPath);
    ytdl(videoUrl, options).pipe(videoWriteStream);

    videoWriteStream.on("finish", () => {
      res.download(videoPath, `${title}.mp3`, () => {
        fs.unlinkSync(videoPath);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: "false",
      message: "Internal Server Error - please contact an admin",
    });
  }
});

export default router;
