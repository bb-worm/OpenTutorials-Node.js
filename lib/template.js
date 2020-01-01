/*
module.exports = ''
: module 내보내기
*/
module.exports = template = {
  html: (title, list, body, authStatusUI, control) => {
    return `<!doctype html>
    <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        ${authStatusUI}
        
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control === undefined ? "" : control}
        ${body}
      </body>
    </html>`;
  },

  list: filelist => {
    let list = `<ul>`;
    for (let i = 0; i < filelist.length; i++) {
      list += `<li><a href="/topic/${filelist[i].id}">${filelist[i].title}</a></li>`;
    }
    list += `</ul>`;

    return list;
  }
};
