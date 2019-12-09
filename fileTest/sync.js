const fs = require('fs');

// console.log('A');
// const result = fs.readFileSync('sample.txt', 'utf-8');
// console.log(result);
// console.log('B');

console.log('A');
fs.readFile('sample.txt','utf-8', (err, data) => {
    console.log(data);
})
console.log('B');