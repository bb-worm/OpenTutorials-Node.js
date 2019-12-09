var http = require('http');
var fs = require('fs');
var url = require('url');

function templateHTML(title, list, description){
  return `<!doctype html>
  <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      <h2>${title}</h2>
      <p>${description}</p>
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

var app = http.createServer(function(request,response){
    var _url = request.url;

    // url.parse(_url, true)
    // .query : querystring 부분을 object로 나타냄
    // .pathname : query를 제외한 path
    // .path : query를 포함한 path
  
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/'){
      if (queryData.id === undefined){
        fs.readdir('./data', (err, filelist) => {
          const description = 'Hello, Node.js';
          const title = 'Welcome';
          const list = templateList(filelist);
          const template = templateHTML(title, list, description);
          
          response.writeHead(200);
          response.end(template);
        })
      }
      else{
        fs.readFile(`data/${queryData.id}`, 'utf-8', (err, description) => {
          fs.readdir('./data', (err, filelist) => {
          const title = queryData.id;
          const list = templateList(filelist);
          const template = templateHTML(title, list, description);

          response.writeHead(200);
          response.end(template);
          })
        })
      }
    }
    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
