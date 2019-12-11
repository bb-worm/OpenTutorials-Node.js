const http = require('http');
const cookie = require('cookie');

http.createServer((request, response) => {

    const coo = request.headers.cookie;
    if (coo !== undefined)
        console.log(cookie.parse(coo));

    response.writeHead(200, {
        'Set-Cookie': ['yummy_cookie=choco','tasty_cookie=strawberry']
    });

    response.end('Cookie!');
}).listen(3000);