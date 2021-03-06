const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const sanitizeHtml = require("sanitize-html");
const template = require("../lib/template");
const qs = require("querystring");
const auth = require("../lib/auth");
const db = require("../lib/db");
const shortid = require("shortid");

router.get("/create", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }

  const title = "WEB - create";
  const list = template.list(request.list); // template 모듈 사용
  const body = `
  <form action="/topic/create_process" method="POST">
  <input type="hidden" name="isOwner" value="${request.isOwner}" />
  <p><input type="text" name="title" placeholder="title" /></p>
  <p>
      <textarea name="description" placeholder="description"></textarea>
  </p>
  <p>
      <input type="submit" />
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

router.post("/create_process", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }

  // bodyparser middleware를 통해 request.on()을 할 필요 없이 body를 가져옴
  const post = request.body;
  const title = post.title;
  const description = post.description;

  const id = shortid.generate();
  db.get("topics")
    .push({
      id: id,
      title: title,
      description: description,
      user_id: request.user.id
    })
    .write();
  response.redirect(`/topic/${id}`);
});

router.get("/update/:pageId", (request, response, next) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }

  const filteredId = path.parse(request.params.pageId).base;

  const topic = db
    .get("topics")
    .find({ id: filteredId })
    .value();
  const user = db
    .get("users")
    .find({ id: topic.user_id })
    .value();

  // 사용자 확인
  if (topic.user_id !== request.user.id) {
    request.flash("error", "Not yours!");
    return response.redirect("/");
  }

  const title = topic.title;
  const list = template.list(request.list); // template 모듈 사용
  const body = `
    <form action="/topic/update_process" method="POST">
      <input type="hidden" name="id" value="${topic.id}" />
      <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
      <p><textarea name="description" placeholder="description">${topic.description}</textarea></p>
      <p><input type="submit" /></p>
    </form>
    `;

  const html = template.html(
    title,
    list,
    body,
    auth.statusUI(request, response)
  ); // template 모듈 사용

  response.send(html);
});

router.post("/update_process", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }

  const post = request.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;

  const topic = db
    .get("topics")
    .find({ id: id })
    .value();

  // 사용자 확인
  if (topic.user_id !== request.user.id) {
    request.flash("error", "Not yours!");
    return response.redirect("/");
  }

  // assign : 수정
  db.get("topics")
    .find({ id: id })
    .assign({
      title: title,
      description: description
    })
    .write();

  response.redirect(`/topic/${topic.id}`);
});

router.post("/delete_process", (request, response) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }

  const post = request.body;
  const id = post.id;
  const filteredId = path.parse(id).base;

  const topic = db
    .get("topics")
    .find({ id: filteredId })
    .value();

  if (topic.user_id !== request.user.id) {
    request.flash("error", "Not yours!");
    return response.redirect("/");
  }

  // 해당 파일 삭제
  db.get("topics")
    .remove({ id: filteredId })
    .write();

  response.redirect("/");
});

// querystring 사용하지 않고, route parameter를 사용
router.get("/:pageId", (request, response, next) => {
  if (!auth.isOwner(request, response)) {
    response.redirect("/");
    return false;
  }

  const filteredId = path.parse(request.params.pageId).base; // queryData.id가 ..을 사용해서 상위 dir로 가는 것을 막을 수 있음

  const topic = db
    .get("topics")
    .find({ id: filteredId })
    .value();
  const user = db
    .get("users")
    .find({ id: topic.user_id })
    .value();

  const sanitizedTitle = sanitizeHtml(topic.title);
  const sanitizedDescription = sanitizeHtml(topic.description, {
    allowedTags: ["h1"]
  });

  const list = template.list(request.list); // template 모듈 사용
  const body = `
    <h2>${sanitizedTitle}</h2>
    <p>${sanitizedDescription}</p>
    <p>by ${user.displayName}</p>`;

  // delete는 link를 사용하는 get으로 구현해서는 안 됨. 접근할 수 없도록 post 방식으로 보내야 함.
  const control = `<a href="/topic/create">create</a>
      <a href="/topic/update/${topic.id}">update</a>
      <form action="/topic/delete_process" method="POST">
        <input type="hidden" name="id" value="${topic.id}" />
        <input type="submit" value="delete" />
      </form>`;
  const html = template.html(
    sanitizedTitle,
    list,
    body,
    auth.statusUI(request, response),
    control
  ); // template 모듈 사용

  response.send(html);
});

module.exports = router;
