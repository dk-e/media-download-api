const express = require('express')

const router = express.Router();
const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg');
const fs = require('fs')
const path = require('path')

// Route base/youtubeMp4

router.route('/getTitle').post(async (req, res) => {

    try {
        const videoUrl = req.body.link;
        if(!ytdl.validateURL)
            return res.status(500).send("Not a valid link!")

        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;

        res.status(200).send(title)
        
    } catch (error) {
        console.log(error)
    }
})


router.route('/downloadMp4').post(async (req, res) => {
    try {
        const videoUrl = req.body.link;

        if (!ytdl.validateURL(videoUrl)) {
            return res.status(500).send("Invalid URL");
        }

        const videoInfo = await ytdl.getInfo(videoUrl);
        const title = videoInfo.videoDetails.title;

        // Download highest quality video
        const videoReadableStream = ytdl(videoUrl, { quality: 'highestvideo' });
        const videoFilePath = path.join(__dirname, 'temp', `${title}.mp4`);

        videoReadableStream.pipe(fs.createWriteStream(videoFilePath));

        videoReadableStream.on('end', async () => {
            try {
                // Extract highest quality audio
                const audioReadableStream = ytdl(videoUrl, { quality: 'highestaudio' });
                const audioFilePath = path.join(__dirname, 'temp', `${title}.mp3`);
                audioReadableStream.pipe(fs.createWriteStream(audioFilePath));

                audioReadableStream.on('end', async () => {
                    try {
                        // Combine audio and video
                        const combinedFilePath = path.join(__dirname, 'temp', `${title}_combined.mp4`);
                        await ffmpeg(videoFilePath)
                            .input(audioFilePath)
                            .outputOptions('-c:v copy')
                            .outputOptions('-c:a aac')
                            .save(combinedFilePath);

                        // Send combined file as response
                        res.download(combinedFilePath, `${title}.mp4`, () => {
                            // Cleanup temp files
                            fs.unlinkSync(videoFilePath);
                            fs.unlinkSync(audioFilePath);
                            fs.unlinkSync(combinedFilePath);
                        });
                    } catch (error) {
                        console.error('Error combining audio and video:', error);
                        res.status(500).send('Error combining audio and video');
                    }
                });
            } catch (error) {
                console.error('Error downloading audio:', error);
                res.status(500).send('Error downloading audio');
            }
        });
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('Error downloading video');
    }
});


router.route('/downloadMp3').post(async (req, res) => {    
    try {
        const videoUrl = req.body.link;

        if(!ytdl.validateURL(videoUrl))
            return res.status(500).send("Invalid URL")
    
        const options = {
            quality: "highestaudio",
            filter: "audio"
        };

        const info = await ytdl.getInfo(videoUrl)
        console.log(info)

        const title = info.videoDetails.title;

        const videoPath = path.join(process.cwd(), "temp", `${encodeURI(title)}.mp4`) 
        console.log(videoPath)

        const videoWriteStream = fs.createWriteStream(videoPath);
        ytdl(videoUrl, options).pipe(videoWriteStream);

        videoWriteStream.on('finish', () => {
            res.download(videoPath, `${title}.mp3`, () => {
                fs.unlinkSync(videoPath)
            })
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error - please contact an admin")
    }
})

module.exports = router