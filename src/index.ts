console.clear();

import express from "express";
import * as dotenv from "dotenv";
import path from "path";
import bodyParser from "body-parser";
dotenv.config();

import getTitleRoute from "./routes/get-title";
import downloadMp4Route from "./routes/download/mp4";
import downloadMp3Route from "./routes/download/mp3";

const app = express();
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("trust-proxy", 1);
app.disable("x-powered-by");

app.use("/get-title", getTitleRoute);
app.use("/download/mp4", downloadMp4Route);
app.use("/download/mp3", downloadMp3Route);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server is now running on port ${port}`));
