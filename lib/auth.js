module.exports = auth = {
  statusUI: (req, res) => {
    let authStatusUI = `<a href="/auth/login">login</a> | 
    <a href="/auth/register">Register</a> |
    <a href="/auth/facebook">Facebook Login</a>`;
    if (req.user) {
      authStatusUI = `${req.user.displayName} | <a href="/auth/logout">logout</a>`;
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
