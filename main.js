const express = require("express");
const app = express();
const fs = require("fs");
const cookie = require("cookie");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const db = require("./lib/db");

const port = 3000;

// middleware
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet"); // 보안 middleware

// middleware 장착
app.use(express.static("public")); // public 폴더에 있는 static files를 사용할 수 있게 함
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(helmet());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  })
);

// session을 사용하므로 session 설정 밑에 넣어야 함
const passport = require("./lib/passport")(app);

const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);
const indexRouter = require("./routes/index");

// 해당 middleware가 get 요청에만 사용되게 함
/*
사용 방식을 통해 사실 아래에서 사용했던 것들이 모두 middleware였음을 알 수 있음
위에서부터 내려오며 매칭되는 middleware를 실행하고, next()를 통해 다음 매칭되는 middleware로 넘어감
*/
app.get("*", (request, response, next) => {
  request.list = db
    .get("topics")
    .take(100)
    .value();
  next();
});

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

// status code 500
// next(err)가 실행되면 여기로 옴
app.use((err, request, response, next) => {
  console.log(err.stack);
  response.status(500).send(`What??????`);
});

// status code 404
app.use((request, response, next) => {
  response.status(404).send(`Sorry, can't find that!!!!!`);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
