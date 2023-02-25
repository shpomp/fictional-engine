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

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/:date?", (req, res) => {
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

  app.get("/api", (req, res) => {
    const currentDate = new Date().toUTCString();
    const currentUnix = Date.parse(currentDate);
    res.json({ unix: currentUnix, utc: currentDate });
  });
});

/////

app.get("/json", (req, res) => {
  const mySecret = process.env["MESSAGE_STYLE"];
  let text;
  if (mySecret === "uppercase") {
    text = "Hello json".toUpperCase();
  } else {
    text = "Hello json";
  }
  res.json({ message: text });
});

//middleware
const middleware = (req, res, next) => {
  req.time = new Date().toString();
  next();
};

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
