var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
const template = require('./lib/template.js');

var app = http.createServer((request, response) => {
    var _url = request.url;

    // url.parse(_url, true)
    // .query : querystring 부분을 object로 나타냄
    // .pathname : query를 제외한 path
    // .path : query를 포함한 path
  
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    
    if (pathname === '/'){
      // home
      if (queryData.id === undefined){
        fs.readdir('./data', 'utf-8', (err, filelist) => {
          const description = 'Hello, Node.js';
          const title = 'Welcome';
          const list = template.list(filelist);
          const body = `<h2>${title}</h2><p>${description}</p>`;
          const control = `<a href="/create">create</a>`;
          const html = template.html(title, list, body, control);
          
          response.writeHead(200);
          response.end(html);
        })
      }
      // read file
      else{
        fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {
          fs.readdir('./data', 'utf-8', (err, filelist) => {
          const title = queryData.id;
          const list = template.list(filelist);
          const body = `<h2>${title}</h2><p>${description}</p>`;

          // delete는 link를 사용하는 get으로 구현해서는 안 됨. 접근할 수 없도록 post 방식으로 보내야 함.
          const control = `<a href="/create">create</a>
          <a href="/update?id=${title}">update</a>

          <form action="delete_process" method="POST">
            <input type="hidden" name="id" value="${title}" />
            <input type="submit" value="delete" />
          </form>`;
          const html = template.html(title, list, body, control);

          response.writeHead(200);
          response.end(html);
          })
        })
      }
    }
    // create
    else if (pathname === '/create'){
      fs.readdir('./data', 'utf-8', (err, filelist) => {
        const title = 'WEB - create';
        const list = template.list(filelist);
        const body = `<form action="/create_process" method="POST">
        <p><input type="text" name="title" placeholder="title" /></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit" />
        </p>
    </form>`;
        const html = template.html(title, list, body);
        
        response.writeHead(200);
        response.end(html);
      })
    }
    // create - redirection
    else if (pathname === '/create_process') {
      let body = '';

      // data event : data chunk를 전송할 때 발생
      request.on('data', data => {
        // console.log(Buffer.from(data).toString());
        body += data;
      });

      // end event : 더 이상 소비할 data가 없을 때 발생
      request.on('end', () => {
        const post = qs.parse(body);
        const title = post.title;
        const description = post.description;
        
        fs.writeFile(`data/${title}`, description, 'utf-8', err => {
          console.log(err);
          response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
          response.end();
        })
      });
    }
    // update
    else if (pathname === '/update'){
      fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {
        fs.readdir('./data', 'utf-8', (err, filelist) => {
        const title = queryData.id;
        const list = template.list(filelist);
        const body = `
        <form action="/update_process" method="POST">
          <input type="hidden" name="id" value="${title}" />
          <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
          <p><textarea name="description" placeholder="description">${description}</textarea></p>
          <p><input type="submit" /></p>
        </form>
        `;
        
        const html = template.html(title, list, body);

        response.writeHead(200);
        response.end(html);
        })
      })
    }
    // update_process
    else if (pathname === '/update_process'){
      let body = '';

      // data event : data chunk를 전송할 때 발생
      request.on('data', data => {
        // console.log(Buffer.from(data).toString());
        body += data;
      });

      // end event : 더 이상 소비할 data가 없을 때 발생
      request.on('end', () => {
        const post = qs.parse(body);
        const id = post.id;
        const title = post.title;
        const description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, (err) => {
          console.log(err);
        });
        fs.writeFile(`data/${title}`, description, 'utf-8', err => {
          console.log(err);
          response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
          response.end();
        })
      });
    }
    // delete_process
    else if (pathname === '/delete_process'){
      let body = '';

      // data event : data chunk를 전송할 때 발생
      request.on('data', data => {
        // console.log(Buffer.from(data).toString());
        body += data;
      });

      // end event : 더 이상 소비할 data가 없을 때 발생
      request.on('end', () => {
        const post = qs.parse(body);
        const id = post.id;
        
        fs.unlink(`data/${id}`, (err) => {
          console.log(err);
          response.writeHead(302, {Location: `/`});
          response.end();
        })
      });
    }
    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
