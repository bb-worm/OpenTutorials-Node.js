const db = require("../lib/db");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

module.exports = function(app) {
  // passport.js 사용
  const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    FacebookStrategy = require("passport-facebook").Strategy;
  const flash = require("connect-flash");

  app.use(passport.initialize()); // passport를 사용하겠다는 의미
  app.use(passport.session()); // 내부적으로 session을 사용하겠다는 의미
  app.use(flash());

  //
  passport.serializeUser((user, done) => {
    // console.log("seri", user);
    done(null, user.id); // session을 사용하겠다고 했으므로, session 파일에 저장됨
  });

  // page 방문 시마다 호출 됨
  // session 파일에 저장된 사용자 정보를 조회하는 용도
  passport.deserializeUser((id, done) => {
    const user = db
      .get("users")
      .find({ id: id })
      .value();
    // console.log("dese", id, user);
    done(null, user);
  });

  // login을 성공했는지 실패했는지 설정
  passport.use(
    new LocalStrategy(
      {
        // filed name이 기본으로 "username"과 "password"로 설정되어 있는데, 이를 변경해줌
        usernameField: "email",
        passwordField: "pwd"
      },
      (email, password, done) => {
        // console.log("localSt", email, password);

        // 해당 email과 pwd를 갖는 user를 찾음
        const user = db
          .get("users")
          .find({ email: email })
          .value();

        if (user) {
          bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
              return done(null, user, { message: "Welcome!" }); // passport.serializeUser 함수를 호출
            } else {
              return done(null, false, {
                message: "Incorrect Password!"
              });
            }
          });
        } else {
          return done(null, false, {
            message: "Incorrect Email!"
          });
        }
      }
    )
  );

  // Facebook Login
  const facebookCredentials = require("../config/facebook.json");

  passport.use(
    new FacebookStrategy(
      facebookCredentials,
      (accessToken, refreshToken, profile, done) => {
        // accessToken으로 요청한 후에 받은 응답으로 호출되는 callback 부분.

        // facebook email
        const email = profile.emails[0].value;

        // find same email in DB
        let user = db
          .get("users")
          .find({ email: email })
          .value();

        if (user) {
          // facebook을 통하지 않은 다른 방식으로 가입되어 있는 경우
          user.facebookId = profile.id;

          // 정보 update
          db.get("users")
            .find({ email: email })
            .assign(user)
            .write();
        } else {
          // facebook의 정보를 가져와서 회원 등록
          user = {
            id: shortid.generate(),
            email: email,
            displayName: profile.displayName,
            facebookId: profile.id
          };

          db.get("users")
            .push(user)
            .write();
        }
        return done(null, user); // serializeUser 함수로 넘어감 -> session에 정보 저장
      }
    )
  );

  app.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: "email" })
  );

  app.get(
    // resource server에서 authorization code 생성 후 redirect 하여 이를 전달
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/",
      failureRedirect: "/auth/login"
    })
  );

  return passport;
};
