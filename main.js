const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// /*
// require(id)
// : module import 하기
// */
// const http = require('http');
// const fs = require('fs');
// const url = require('url');
// const qs = require('querystring');
// const path = require('path');
// const sanitizeHtml = require('sanitize-html');
// const template = require('./lib/template.js'); // 직접 export 한 모듈

// /* 
// http.createServer((request, response) => {})
// : 해당 서버로 오는 HTTP 요청마다 createServer 함수가 호출됨
// */ 
// const app = http.createServer((request, response) => {
//     /*
//     request.url
//     : HTTP request에 있는 URL string
//     */
//     const _url = request.url;
    
//     /* 
//     require('url').parse(_url, true)
//     .path : pathname + query
//     .query : url의 querystring 부분을 object로 나타냄
//     .pathname : query를 제외한 path
//     */
  
//     const queryData = url.parse(_url, true).query;
//     const pathname = url.parse(_url, true).pathname;
    
//     if (pathname === '/'){

//       // Home -> 불러올 파일 없음
//       if (queryData.id === undefined){

//         /*
//         require('fs').readdir(path[,options],callback)
//         - path: 읽어올 directory 경로
//         - options: encoding property
//         - callback: (error, filelist) => {}
//         - 비동기적으로 실행되며, readdirSync(path[,options])를 통해 동기적으로 실행할 수도 있음
//         */
//         fs.readdir('./data', 'utf-8', (err, filelist) => {
//           const description = 'Hello, Node.js';
//           const title = 'Welcome';
//           const list = template.list(filelist); // template 모듈 사용
//           const body = `<h2>${title}</h2><p>${description}</p>`;
//           const control = `<a href="/create">create</a>`;
//           const html = template.html(title, list, body, control); // template 모듈 사용
          
//           /*
//           response.writeHead(statusCode[,statusMessage][,headers])
//           - statusCode: HTTP status code
//           - statusMessage: human-readable message
//           - headers: object로 이루어진 response headers
//           */
//           response.writeHead(200);
//           /*
//           response.end([data[,encode]][,callback])
//           - data: body 정보, response.write(data, encoding)으로 설정할 수도 있음
//           - callback: response stream 종료 후에 실행됨
//           */
//           response.end(html);
//         })
//       }

//       // 파일 불러와서 read
//       else{
//         /* 
//         path.parse('/home/user/dir/file.txt')
//         .dir : '/home/user/dir'
//         .base : 'file.txt'
//         .ext : '.txt'
//         .name : 'file'
//         */
//         const filteredId = path.parse(queryData.id).base; // queryData.id가 ..을 사용해서 상위 dir로 가는 것을 막을 수 있음

//         /*
//         require('fs').readFile(path[,options],callback)
//         - path: 읽어올 File 경로
//         - options: encoding property
//         - callback: (error, data) => {}
//         - 비동기적으로 실행되며, readFileSync(path[,options])를 통해 동기적으로 실행할 수도 있음
//         */
//         fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
//           fs.readdir('./data', 'utf-8', (err, filelist) => {
//             const title = queryData.id;

//             /*
//             sanitize-html: tag와 attribute가 포함된 dirty html이 문제를 발생시키지 않도록 살균(sanitize)
            
//             설치 : npm install sanitize-html

//             require('sanitize-html')(dirty html[,{options}])
//             - options: allowedTags, allowdAttributes 등 특정 tag와 attribute 허용 가능
//             */
//             const sanitizedTitle = sanitizeHtml(title);
//             const sanitizedDescription = sanitizeHtml(description, {
//               allowedTags: ['h1']
//             });

//             const list = template.list(filelist); // template 모듈 사용
//             const body = `<h2>${title}</h2><p>${sanitizedDescription}</p>`;

//             // delete는 link를 사용하는 get으로 구현해서는 안 됨. 접근할 수 없도록 post 방식으로 보내야 함.
//             const control = `<a href="/create">create</a>
//             <a href="/update?id=${sanitizedTitle}">update</a>

//             <form action="delete_process" method="POST">
//               <input type="hidden" name="id" value="${sanitizedTitle}" />
//               <input type="submit" value="delete" />
//             </form>`;
//             const html = template.html(sanitizedTitle, list, body, control); // template 모듈 사용

//             response.writeHead(200);
//             response.end(html);
//           })
//         })
//       }
//     }
//     // create
//     else if (pathname === '/create'){
//       fs.readdir('./data', 'utf-8', (err, filelist) => {
//         const title = 'WEB - create';
//         const list = template.list(filelist); // template 모듈 사용
//         const body = `<form action="/create_process" method="POST">
//         <p><input type="text" name="title" placeholder="title" /></p>
//         <p>
//             <textarea name="description" placeholder="description"></textarea>
//         </p>
//         <p>
//             <input type="submit" />
//         </p>
//     </form>`;
//         const html = template.html(title, list, body); // template 모듈 사용
        
//         response.writeHead(200);
//         response.end(html);
//       })
//     }
//     // create - redirection
//     else if (pathname === '/create_process') {
//       let body = '';

//       /*
//       EventEmitter : 이벤트 처리를 위한 Class. 이를 상속한 객체를 통해 쓰일 수 있음

//       eventEmitter.on(eventName, listener)
//       - event: 제공되는 event를 사용할 수도 있고, 새로운 event를 만들어 사용할 수도 있음
//       - listener: callback function
//       */

//       // data event : data chunk를 전송할 때 발생
//       request.on('data', data => {
//         // console.log(Buffer.from(data).toString());
//         body += data;
//       });

//       // end event : 더 이상 소비할 data가 없을 때 발생
//       request.on('end', () => {
//         /*
//         require(querystring).parse(str[,sep[,eq[,options]]])
//         - str: parsing할 URL query
//         - seq: default '&'
//         - eq: default '='
//         - key:value pairs를 object 타입으로 반환함
//         */
//         const post = qs.parse(body);
//         const title = post.title;
//         const description = post.description;
        
//         /*
//         require('fs').writeFile(file, data[,options], callback)
//         - file: filename or file descriptor
//         - data: file에 채워질 내용
//         - callback: (err) => {}
//         - file이 없으면 생성하고, 있으면 수정함
//         */
//         fs.writeFile(`data/${title}`, description, 'utf-8', err => {
//           console.log(err);
          
//           // status code 302 : redirection
//           // Location 헤더를 설정
//           response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
//           response.end();
//         })
//       });
//     }
//     // update
//     else if (pathname === '/update'){
//       const filteredId = path.parse(queryData.id).base;
//       fs.readFile(`data/${filteredId}`, 'utf-8', (err, description) => {
//         fs.readdir('./data', 'utf-8', (err, filelist) => {
//         const title = queryData.id;
//         const list = template.list(filelist); // template 모듈 사용
//         const body = `
//         <form action="/update_process" method="POST">
//           <input type="hidden" name="id" value="${title}" />
//           <p><input type="text" name="title" placeholder="title" value="${title}" /></p>
//           <p><textarea name="description" placeholder="description">${description}</textarea></p>
//           <p><input type="submit" /></p>
//         </form>
//         `;
        
//         const html = template.html(title, list, body); // template 모듈 사용

//         response.writeHead(200);
//         response.end(html);
//         })
//       })
//     }
//     // update_process
//     else if (pathname === '/update_process'){
//       let body = '';

//       // data event : data chunk를 전송할 때 발생
//       request.on('data', data => {
//         // console.log(Buffer.from(data).toString());
//         body += data;
//       });

//       // end event : 더 이상 소비할 data가 없을 때 발생
//       request.on('end', () => {
//         const post = qs.parse(body);
//         const id = post.id;
//         const title = post.title;
//         const description = post.description;
//         fs.rename(`data/${id}`, `data/${title}`, (err) => {
//           console.log(err);
//         });
//         fs.writeFile(`data/${title}`, description, 'utf-8', err => {
//           console.log(err);
//           response.writeHead(302, {Location: `/?id=${qs.escape(title)}`});
//           response.end();
//         })
//       });
//     }
//     // delete_process
//     else if (pathname === '/delete_process'){
//       let body = '';

//       // data event : data chunk를 전송할 때 발생
//       request.on('data', data => {
//         // console.log(Buffer.from(data).toString());
//         body += data;
//       });

//       // end event : 더 이상 소비할 data가 없을 때 발생
//       request.on('end', () => {
//         const post = qs.parse(body);
//         const id = post.id;
//         const filteredId = path.parse(id).base;

//         /*
//         require('fs').unlink(path, callback)
//         - path: 삭제할 file의 경로
//         - callback: (err) => {}
//         - directory 삭제할 때는 fs.rmdir()을 사용해야 함
//         */
//         fs.unlink(`data/${filteredId}`, (err) => {
//           console.log(err);
//           response.writeHead(302, {Location: `/`});
//           response.end();
//         })
//       });
//     }
//     else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// /*
// server.listen([port[,host[,backlog]]][,callback])
// : 주어진 port와 host에 대해 TCP server가 connection을 지켜보기 시작
// */
// app.listen(3000);
