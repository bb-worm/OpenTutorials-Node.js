const express = require('express');
const router = express.Router();
const template = require('../lib/template');

// Home
router.get('/', (request, response) => {
    const description = 'Hello, Node.js';
    const title = 'Welcome';
    const list = template.list(request.list); // template 모듈 사용
    const body = `<h2>${title}</h2><p>${description}</p>
    <img src="/images/music.jpg" style="width:500px;" />`;
    const control = `<a href="/topic/create">create</a>`;
    const html = template.html(title, list, body, control); // template 모듈 사용

    response.send(html);
})

module.exports = router;