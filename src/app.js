import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,

}));

app.use(express.json({ limit: "16kb" })) //json config 

app.use(express.urlencoded({ extended: true, limit: "16kb" })) // url config , extended means nested objects 

app.use(express.static("public")) //config to store files and folders which is a public asset 

app.use(cookieParser()) //cookie parser config

export { app }