const db = require("../lib/db");
const bcrypt = require("bcrypt");

module.exports = function(app) {
  // passport.js 사용
  const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;
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

  return passport;
};
