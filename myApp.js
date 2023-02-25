let express = require("express");
let app = express();
var bodyParser = require("body-parser");

app.use(function middleware(req, res, next) {
  var string = req.method + " " + req.path + " - " + req.ip;
  console.log(string);
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
  // console.log(JSON.stringify(req.headers));
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

//

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
});

app.get("/name", function (req, res) {
  var { first: firstName, last: lastName } = req.query;
  res.json({
    name: `${firstName} ${lastName}`,
  });
});

app.post("/name", function (req, res) {
  res.json({ name: req.body.first + " " + req.body.last });
});

console.log("Hello World");

module.exports = app;
