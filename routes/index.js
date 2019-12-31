const express = require("express");
const router = express.Router();
const template = require("../lib/template");
const auth = require("../lib/auth");

// Home
router.get("/", (request, response) => {
  const fmsg = request.flash();
  let feedback = "";
  if (fmsg.success) {
    feedback = fmsg.success[0];
  }

  console.log("/", request.user);
  const description = "Hello, Node.js";
  const title = "Welcome";
  const list = template.list(request.list); // template 모듈 사용
  const body = `
    <div style="color:red;">${feedback}</div>
    <h2>${title}</h2><p>${description}</p>
    <img src="/images/music.jpg" style="width:500px;" />`;
  const control = `<a href="/topic/create">create</a>`;
  const html = template.html(
    title,
    list,
    body,
    auth.statusUI(request, response),
    control
  ); // template 모듈 사용

  response.send(html);
});

module.exports = router;
