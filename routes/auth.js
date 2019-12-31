const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const qs = require("querystring");
const auth = require("../lib/auth");

const authData = {
  email: "xofyd99",
  password: "111",
  nickname: "bb_worm"
};

router.get("/login", (request, response) => {
  const title = "WEB - login";
  const list = template.list(request.list); // template 모듈 사용
  const body = `
  <form action="/auth/login_process" method="POST">
  <p><input type="text" name="email" placeholder="email" /></p>
  <p><input type="password" name="pwd" placeholder="password" /></p>
  <p>
      <input type="submit" value="login" />
  </p>
  </form>`;
  const html = template.html(
    title,
    list,
    body,
    auth.statusUI(request, response)
  ); // template 모듈 사용

  response.send(html);
});

router.post("/login_process", (request, response) => {
  // bodyparser middleware를 통해 request.on()을 할 필요 없이 body를 가져옴
  const post = request.body;
  const email = post.email;
  const password = post.pwd;

  if (email === authData.email && password === authData.password) {
    request.session.is_logined = true;
    request.session.nickname = authData.nickname;
    request.session.save(() => {
      response.redirect("/");
    });
  } else {
    response.send("Who?");
  }
});

router.get("/logout", (request, response) => {
  request.session.destroy(err => {
    // console.log(request.session.is_logined);
    response.redirect("/");
  });
});

module.exports = router;
