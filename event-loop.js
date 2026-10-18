console.log('1 sync');

setTimeout(() => console.log('4 setTimeout 0'), 0);

Promise.resolve().then(() => console.log('3 microtask'));

console.log('2 sync');
