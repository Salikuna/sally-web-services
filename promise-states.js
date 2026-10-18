const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pending = wait(1000);
const fulfilled = Promise.resolve(['First note']);
const rejected = Promise.reject(new Error('no such file'));

rejected.catch(() => {}); // Handle rejection so Node doesn't crash.

console.log(pending);
console.log(fulfilled);
console.log(rejected);