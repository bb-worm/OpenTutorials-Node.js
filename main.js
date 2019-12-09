var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request,response){
    var _url = request.url;

    // url.parse(_url, true)
    // .query : querystring 부분을 object로 나타냄
    // .pathname : query를 제외한 path
    // .path : query를 포함한 path
  
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    let title = queryData.id;

    if (pathname === '/'){
      fs.readFile(`data/${queryData.id}`, 'utf-8', (err, data) => {
        const template = `
        <!doctype html>
        <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">WEB</a></h1>
            <ol>
              <li><a href="/?id=HTML">HTML</a></li>
              <li><a href="/?id=CSS">CSS</a></li>
              <li><a href="/?id=JavaScript">JavaScript</a></li>
            </ol>
            <h2>${title}</h2>
            <p>${data}</p>
          </body>
        </html>
        `;
        response.writeHead(200);
        response.end(template);
      })
    }
    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
