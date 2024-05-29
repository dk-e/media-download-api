const express = require('express')
const cors = require('cors')


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}))

const corsOptions = {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
};

// app.use(cors(corsOptions))
app.use(cors({ origin: "*" })) // default

app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, GET, OPTIONS"
    )
})

const youtubeRoutes = require("./api/youtube.js");

app.use("/youtube", youtubeRoutes)


const port = 5000
app.listen(5000, function () {
    console.log(`Server started on port: ${port}`)
})