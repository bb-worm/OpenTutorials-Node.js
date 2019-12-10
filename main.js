const express = require('express')
const app = express()
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');
const template = require('./lib/template');

const port = 3000

// middleware 
const bodyParser = require('body-parser');
const compression = require('compression');

// middleware 장착
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

// 해당 middleware가 get 요청에만 사용되게 함
/*
사용 방식을 통해 사실 아래에서 사용했던 것들이 모두 middleware였음을 알 수 있음
위에서부터 내려오며 매칭되는 middleware를 실행하고, next()를 통해 다음 매칭되는 middleware로 넘어감
*/
app.get('*', (request, response, next) => {
  fs.readdir('./data', 'utf-8', (err, filelist) => {
    request.list = filelist;
    next();
  })
})

// Home
app.get('/', (request, response) => {
  console.log(request.list);

  const description = 'Hello, Node.js';
  const title = 'Welcome';
  const list = template.list(request.list); // template 모듈 사용
  const body = `<h2>${title}</h2><p>${description}</p>`;
  const control = `<a href="/create">create</a>`;
  const html = template.html(title, list, body, control); // template 모듈 사용
  
  response.send(html);
})

// querystring 사용하지 않고, route parameter를 사용
app.get('/page/:pageId', (request, response) => {
  const filteredId = path.parse(request.params.pageId).base; // queryData.id가 ..을 사용해서 상위 dir로 가는 것을 막을 수 있음
  fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
    const title = request.params.pageId;
    const sanitizedTitle = sanitizeHtml(title);
    const sanitizedDescription = sanitizeHtml(description, {
      allowedTags: ['h1']
    });

    const list = template.list(request.list); // template 모듈 사용
    const body = `<h2>${title}</h2><p>${sanitizedDescription}</p>`;

    // delete는 link를 사용하는 get으로 구현해서는 안 됨. 접근할 수 없도록 post 방식으로 보내야 함.
    const control = `<a href="/create">create</a>
    <a href="/update/${sanitizedTitle}">update</a>
    <form action="/delete_process" method="POST">
      <input type="hidden" name="id" value="${sanitizedTitle}" />
      <input type="submit" value="delete" />
    </form>`;
    const html = template.html(sanitizedTitle, list, body, control); // template 모듈 사용

    response.send(html);
  })
})

app.get('/create', (request, response) => {
  const title = 'WEB - create';
  const list = template.list(request.list); // template 모듈 사용
  const body = `
  <form action="/create_process" method="POST">
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

app.post('/create_process', (request, response) => {
  // bodyparser middleware를 통해 request.on()을 할 필요 없이 body를 가져옴
  const post = request.body;
  const title = post.title;
  const description = post.description;
  
  fs.writeFile(`data/${title}`, description, 'utf-8', err => {
    response.redirect(`/page/${qs.escape(title)}`);
  })
})

app.get('/update/:pageId', (request, response) => {
  const filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
      const title = request.params.pageId;
      const list = template.list(request.list); // template 모듈 사용
      const body = `
      <form action="/update_process" method="POST">
        <input type="hidden" name="id" value="${title}" />
        <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
        <p><textarea name="description" placeholder="description">${description}</textarea></p>
        <p><input type="submit" /></p>
      </form>
      `;
      
      const html = template.html(title, list, body); // template 모듈 사용

      response.send(html);
    })
})

app.post('/update_process', (request, response) => {
  const post = request.body;
  const id = post.id;
  const title = post.title;
  const description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, (err) => {
    console.log(err);
  });
  fs.writeFile(`data/${title}`, description, 'utf-8', err => {
    response.redirect(`/page/${qs.escape(title)}`)
  })
})

app.post('/delete_process', (request, response) => {
  const post = request.body;
  const id = post.id;
  const filteredId = path.parse(id).base;

  fs.unlink(`data/${filteredId}`, (err) => {
    response.redirect('/');
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))