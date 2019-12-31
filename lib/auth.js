module.exports = auth = {
  statusUI: (req, res) => {
    let authStatusUI = `<a href="/auth/login">login</a>`;
    if (req.user) {
      authStatusUI = `${req.user.nickname} | <a href="/auth/logout">logout</a>`;
    }
    return authStatusUI;
  },
  isOwner: (req, res) => {
    if (req.user) {
      return true;
    } else {
      return false;
    }
  }
};
