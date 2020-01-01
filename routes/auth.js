const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const qs = require("querystring");
const auth = require("../lib/auth");

// lowdb
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ users: [] }).write();

// shortid
const shortid = require("shortid");

module.exports = passport => {
  router.get("/login", (request, response) => {
    const fmsg = request.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }

    const title = "WEB - login";
    const list = template.list(request.list); // template 모듈 사용
    const body = `
    <div style="color:red;">${feedback}</div>
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

  // passport가 login을 처리하게 함
  router.post(
    "/login_process",
    passport.authenticate("local", {
      successRedirect: "/", // login 성공 시
      failureRedirect: "/auth/login", // login 실패 시
      successFlash: true,
      failureFlash: true
    })
  );

  router.get("/logout", (request, response) => {
    request.logout(); // passport.js 에서 로그아웃, req.user와 login session을 비움
    response.redirect("/");
  });

  router.get("/register", (request, response) => {
    const fmsg = request.flash();
    let feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }

    const title = "WEB - register";
    const list = template.list(request.list); // template 모듈 사용
    const body = `
    <div style="color:red;">${feedback}</div>
    <form action="/auth/register_process" method="POST">
    <p><input type="text" name="email" placeholder="email" /></p>
    <p><input type="password" name="pwd" placeholder="password" /></p>
    <p><input type="password" name="pwd2" placeholder="password" /></p>
    <p><input type="text" name="displayName" placeholder="display name"></p>
    <p>
        <input type="submit" value="register" />
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

  router.post("/register_process", (request, response) => {
    const post = request.body;
    const email = post.email;
    const pwd = post.pwd;
    const pwd2 = post.pwd2;
    const displayName = post.displayName;

    if (email === "" || pwd === "" || pwd2 === "" || displayName === "") {
      request.flash("error", "Must write all boxs!");
      response.redirect("/auth/register");
    } else if (pwd !== pwd2) {
      request.flash("error", "Password must same!");
      response.redirect("/auth/register");
    } else if (
      db
        .get("users")
        .find({ email: email })
        .value()
    ) {
      request.flash("error", "Already used email!");
      response.redirect("/auth/register");
    } else {
      db.get("users")
        .push({
          id: shortid.generate(),
          email: email,
          password: pwd,
          displayName: displayName
        })
        .write();

      response.redirect("/");
    }
  });

  return router;
};
