const express = require('express')

const router = express.Router();
const ytdl = require('ytdl-core')
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
        const videoUrl = req.body.link

        if(!ytdl.validateURL) 
            return res.status(500).send("Invalid URL")

        // Our ytdl options
        const options = {
        quality: "highestvideo",
        filter: "videoandaudio"
        };

        const info = await ytdl.getInfo(videoUrl); // query video to get info

        const title = info.videoDetails.title; // save title of the video

        const videoPath = path.join(process.cwd(), "temp", `${encodeURI(title)}.mp4`) // choosing filename
        console.log(videoPath)

        // Initialize download and put it into the path
        const videoWriteStream = fs.createWriteStream(videoPath);
        ytdl(videoUrl, options).pipe(videoWriteStream)

        // Callback to check if it is finished
        videoWriteStream.on('finish', () => {
            res.download(videoPath, `${title}.mp4`, () => {
                fs.unlinkSync(videoPath) // Delete our video once it is downloaded
            })
        })

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal server error - please contact an admin")
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