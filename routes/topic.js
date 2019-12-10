const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const template = require('../lib/template');
const qs = require('querystring');

router.get('/create', (request, response) => {
  const title = 'WEB - create';
  const list = template.list(request.list); // template 모듈 사용
  const body = `
  <form action="/topic/create_process" method="POST">
  <p><input type="text" name="title" placeholder="title" /></p>
  <p>
      <textarea name="description" placeholder="description"></textarea>
  </p>
  <p>
      <input type="submit" />
  </p>
  </form>`;
  const html = template.html(title, list, body); // template 모듈 사용

  response.send(html);
})
  
router.post('/create_process', (request, response) => {
  // bodyparser middleware를 통해 request.on()을 할 필요 없이 body를 가져옴
  const post = request.body;
  const title = post.title;
  const description = post.description;
  
  fs.writeFile(`data/${title}`, description, 'utf-8', err => {
    response.redirect(`/topic/${qs.escape(title)}`);
  })  
})
  
router.get('/update/:pageId', (request, response, next) => {
  const filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
    if (err){
      // status code 500
      next(err);
    }
    else{
      const title = request.params.pageId;
    const list = template.list(request.list); // template 모듈 사용
    const body = `
    <form action="/topic/update_process" method="POST">
      <input type="hidden" name="id" value="${title}" />
      <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
      <p><textarea name="description" placeholder="description">${description}</textarea></p>
      <p><input type="submit" /></p>
    </form>
    `;
    
    const html = template.html(title, list, body); // template 모듈 사용

    response.send(html);
    }
  })
})
  
router.post('/update_process', (request, response) => {
  const post = request.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, (err) => {
    console.log(err);
  });
  fs.writeFile(`data/${title}`, description, 'utf-8', err => {
    response.redirect(`/topic/${qs.escape(title)}`)
  })
})
  
router.post('/delete_process', (request, response) => {
  const post = request.body;
  const id = post.id;
  const filteredId = path.parse(id).base;

  fs.unlink(`data/${filteredId}`, (err) => {
    response.redirect('/');
  })
})
  
// querystring 사용하지 않고, route parameter를 사용
router.get('/:pageId', (request, response, next) => {
  const filteredId = path.parse(request.params.pageId).base; // queryData.id가 ..을 사용해서 상위 dir로 가는 것을 막을 수 있음
  fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
    if (err){
      // status code 500
      next(err);
    }
    else{
      const title = request.params.pageId;
      const sanitizedTitle = sanitizeHtml(title);
      const sanitizedDescription = sanitizeHtml(description, {
        allowedTags: ['h1']
      });
  
      const list = template.list(request.list); // template 모듈 사용
      const body = `<h2>${title}</h2><p>${sanitizedDescription}</p>`;
  
      // delete는 link를 사용하는 get으로 구현해서는 안 됨. 접근할 수 없도록 post 방식으로 보내야 함.
      const control = `<a href="/topic/create">create</a>
      <a href="/topic/update/${sanitizedTitle}">update</a>
      <form action="/topic/delete_process" method="POST">
        <input type="hidden" name="id" value="${sanitizedTitle}" />
        <input type="submit" value="delete" />
      </form>`;
      const html = template.html(sanitizedTitle, list, body, control); // template 모듈 사용
  
      response.send(html);
    }
  })
})

  module.exports = router;