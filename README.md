# media-download-api
<p>A JavaScript API i intitially created for YT > MP4</p>

## Uses
<ul>
    <li>Convert & download YouTube videos to MP4 via its URL</li>
    <li>(soon) Convert & download YouTube videos to MP3 via its URL</li>
</ul>

## Endpoints

| Method  | Endpoint | Description |
-------------------------|--------------------------|---------------|
|POST | (xxx_xxx)/youtube/getTitle | Gets title back of the Video  |
|POST  | (xxx_xxx)/youtube/downloadMp4 | Downloads an Mp4 video at 360p (Other qualities soon)  |

## Usage

### Examples
<p>Getting Title and Downloading Mp4 of video - added functionality so it downloads onClick and doesn't redirect. </p>

```js
    async function handleDownload() {
        const youtubeURL = document.getElementById("linkInput").value;
    
        try {

        const title = await axios.post('http://localhost:5000/youtube/getTitle', 
            { link: youtubeURL }
        );

        const video = await axios.post('http://localhost:5000/youtube/downloadMp4', 
        { link: youtubeURL }, 
        {
            responseType: 'blob'
        });

        // This is so when the user downloads, it directly downloads and doesnt redirect to another page
        const url = window.URL.createObjectURL(new Blob([video.data])) // Create a URL using the blob data
        const link = document.createElement("a"); // Create a fake a tag
        link.href = url; // set href to the fake blob
        link.setAttribute('download', `${title.data}.mp4`) // give it the attribute download, and make sure its mp4
        document.body.appendChild(link); // append the link to the document
        link.click(); // fake click

        console.log(title.data)
        } catch (error) {
        console.log(error)
        }
    }
```
