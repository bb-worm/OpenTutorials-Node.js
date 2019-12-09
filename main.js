var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control){
  return `<!doctype html>
  <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control === undefined ? '' : control}
      ${body}
    </body>
  </html>`;
}

function templateList(filelist) {
  let list = `<ul>`;
  for (let i=0; i< filelist.length; i++){
    list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  }
  list += `</ul>`;
  
  return list;
}

var app = http.createServer(function(request, response){
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
          const list = templateList(filelist);
          const body = `<h2>${title}</h2><p>${description}</p>`;
          const control = `<a href="/create">create</a>`;
          const template = templateHTML(title, list, body, control);
          
          response.writeHead(200);
          response.end(template);
        })
      }
      // read file
      else{
        fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {
          fs.readdir('./data', 'utf-8', (err, filelist) => {
          const title = queryData.id;
          const list = templateList(filelist);
          const body = `<h2>${title}</h2><p>${description}</p>`;
          const control = `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`;
          const template = templateHTML(title, list, body, control);

          response.writeHead(200);
          response.end(template);
          })
        })
      }
    }
    // create
    else if (pathname === '/create'){
      fs.readdir('./data', 'utf-8', (err, filelist) => {
        const title = 'WEB - create';
        const list = templateList(filelist);
        const body = `<form action="/create_process" method="POST">
        <p><input type="text" name="title" placeholder="title" /></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit" />
        </p>
    </form>`;
        const template = templateHTML(title, list, body);
        
        response.writeHead(200);
        response.end(template);
      })
    }
    // create - redirection
    else if (pathname === '/create_process') {
      let body = '';
      request.on('data', data => {
        // console.log(Buffer.from(data).toString());
        body += data;
      });
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
        const list = templateList(filelist);
        const body = `
        <form action="/update_process" method="POST">
          <input type="hidden" name="id" value="${title}" />
          <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
          <p><textarea name="description" placeholder="description">${description}</textarea></p>
          <p><input type="submit" /></p>
        </form>
        `;
        
        const template = templateHTML(title, list, body);

        response.writeHead(200);
        response.end(template);
        })
      })
    }
    // update_process
    else if (pathname === '/update_process'){
      let body = '';
      request.on('data', data => {
        // console.log(Buffer.from(data).toString());
        body += data;
      });
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
    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
