const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const qs = require("querystring");
const auth = require("../lib/auth");

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

router.get("/logout", (request, response) => {
  request.logout(); // passport.js 에서 로그아웃, req.user와 login session을 비움
  response.redirect("/");
});

module.exports = router;
