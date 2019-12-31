module.exports = auth = {
  statusUI: (req, res) => {
    let authStatusUI = `<a href="/auth/login">login</a>`;
    if (req.session.is_logined) {
      authStatusUI = `${req.session.nickname}  <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  },
  isOwner: (req, res) => {
    return req.session.is_logined;
  }
};
