let express = require("express");
const validURL = require("valid-url");
const shortID = require("shortid");
let app = express();
require("dotenv").config();

let bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

app.use(function middleware(req, res, next) {
  var string = req.method + " " + req.path + " - " + req.ip;
  console.log("middleware", string);
  next();
});

app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//middleware
const middleware = (req, res, next) => {
  req.time = new Date().toString();
  next();
};

// get /
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Request Header Parser Microservice

app.get("/api/whoami", function (req, res) {
  const ip = req.ip;
  const language = req.headers["accept-language"];
  const software = req.headers["user-agent"];
  res.send({ ipaddress: ip, language: language, software: software });
});

// Timestamp Microservice

app.get("/api", (req, res) => {
  const currentDate = new Date().toUTCString();
  const currentUnix = Date.parse(currentDate);
  res.json({ unix: currentUnix, utc: currentDate });
});
app.get("/api/:date?", (req, res) => {
  const dateString = req.params.date;
  const dateStringRegex = /^[0-9]+$/;
  const numbersOnly = dateStringRegex.test(dateString);

  if (!numbersOnly) {
    const unixTimestamp = Date.parse(dateString);
    const utcDate = new Date(unixTimestamp).toUTCString();

    unixTimestamp
      ? res.json({ unix: unixTimestamp, utc: utcDate })
      : res.json({ error: "Invalid Date" });
  } else {
    const unixTimestamp = parseInt(dateString);
    const actualDate = new Date(unixTimestamp);
    const utcDate = actualDate.toUTCString();

    res.json({ unix: unixTimestamp, utc: utcDate });
  }
});

// random

app.get("/now", middleware, (req, res) => {
  res.send({
    time: req.time,
  });
});

app.get("/:word/echo", (req, res) => {
  const { word } = req.params;
  res.json({
    echo: word,
  });
  s;
});

/// URL shortener microservice

// SCHEMA
const Schema = mongoose.Schema;

const urlSchema = new Schema({
  originalURL: String,
  shortURL: String,
});

const URL = mongoose.model("URL", urlSchema);

// App middleware
//app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.post("/api/shorturl/", async (req, res) => {
  console.log("req.body", JSON.stringify(req.body));
  const { url } = req.body;
  const shortURL = shortID.generate();
  console.log("validURL", validURL.isUri(url));

  if (validURL.isWebUri(url) === undefined) {
    res.json({
      error: "invalid url",
    });
  } else {
    try {
      let findOne = await URL.findOne({
        originalURL: url,
      });
      if (findOne) {
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      } else {
        findOne = new URL({
          originalURL: url,
          shortURL,
        });
        await findOne.save();
        res.json({
          original_url: findOne.originalURL,
          short_url: findOne.shortURL,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json("Server error..");
    }
  }
});

app.get("/api/shorturl/:shortURL?", async (req, res) => {
  try {
    const urlParams = await URL.findOne({
      shortURL: req.params.shortURL,
    });
    if (urlParams) {
      return res.redirect(urlParams.originalURL);
    }
    return res.status(404).json("No URL found");
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error..");
  }
});

// File metadata microservice

let multer = require("multer");
let upload = multer({ dest: "uploads/" });

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  try {
    res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    res.send(400);
  }
});

module.exports = app;
