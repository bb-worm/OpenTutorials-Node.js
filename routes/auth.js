const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const qs = require("querystring");
const auth = require("../lib/auth");

// lowdb
const db = require("../lib/db");

// shortid
const shortid = require("shortid");

// bcrypt : 암호화
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

    // 입력 검증
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
      const user = db
        .get("users")
        .find({ email: email })
        .value();

      if (user.password) {
        // used email & there is a pwd
        request.flash("error", "Already used email!");
        response.redirect("/auth/register");
      } else {
        // used email, but no pwd : facebook login으로 가입된 것이므로 update 해줌
        bcrypt.hash(pwd, saltRounds, (err, hash) => {
          user.password = hash;
          user.displayName = displayName;
          db.get("users")
            .find({ email: email })
            .assign(user)
            .write();
          request.login(user, err => {
            return response.redirect("/");
          });
        });
      }
    } else {
      // 회원 신규 등록
      bcrypt.hash(pwd, saltRounds, (err, hash) => {
        const user = {
          id: shortid.generate(),
          email: email,
          password: hash,
          displayName: displayName
        };
        db.get("users")
          .push(user)
          .write();

        request.login(user, err => {
          return response.redirect("/");
        });
      });
    }
  });

  return router;
};
