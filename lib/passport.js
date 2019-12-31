module.exports = function(app) {
  const authData = {
    email: "xofyd99",
    password: "111",
    nickname: "bb_worm"
  };

  // passport.js 사용
  const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;
  const flash = require("connect-flash");

  app.use(passport.initialize()); // passport를 사용하겠다는 의미
  app.use(passport.session()); // 내부적으로 session을 사용하겠다는 의미
  app.use(flash());

  //
  passport.serializeUser((user, done) => {
    done(null, user.email); // session을 사용하겠다고 했으므로, session 파일에 저장됨
  });

  // page 방문 시마다 호출 됨
  // session 파일에 저장된 사용자 정보를 조회하는 용도
  passport.deserializeUser((id, done) => {
    done(null, authData);
  });

  // login을 성공했는지 실패했는지 설정
  passport.use(
    new LocalStrategy(
      {
        // filed name이 기본으로 "username"과 "password"로 설정되어 있는데, 이를 변경해줌
        usernameField: "email",
        passwordField: "pwd"
      },
      (username, password, done) => {
        if (username === authData.email) {
          if (password === authData.password) {
            return done(null, authData, { message: "Welcome!" }); // passport.serializeUser 함수를 호출함
          }
          // wrong password
          else {
            return done(null, false, { message: "Incorrect password." });
          }
        }
        // wrong email
        else {
          return done(null, false, { message: "Incorrect username." });
        }
      }
    )
  );

  return passport;
};
