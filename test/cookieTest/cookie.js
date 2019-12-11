const http = require('http');
http.createServer((request, response) => {

    response.writeHead(200, {
        'Set-Cookie': ['yummy_cookie=choco', 'tasty_cookie=strawberry']
    });

    response.end('Cookie!');
}).listen(3000);