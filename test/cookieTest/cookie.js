const http = require('http');
const cookie = require('cookie');

http.createServer((request, response) => {

    const coo = request.headers.cookie;
    if (coo !== undefined)
        console.log(cookie.parse(coo));

    response.writeHead(200, {
        'Set-Cookie': [
            'yummy_cookie=choco',
            'tasty_cookie=strawberry',
            `Permanent=cookies; Max-Age=${60*60*24*30}`,
            'Secure_cookie=cookies; Secure', // https로 통신하는 경우에만 웹브라우저가 쿠키를 서버로 전송
            'Http_cookie=cookies; HttpOnly'] // javacript의 document.cookie로 사용되는 것을 막음
    });

    response.end('Cookie!');
}).listen(3000);