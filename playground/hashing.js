// const { SHA256 } = require('crypto-js');
//
// let message = 'I am user number 3';
// const hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
// // Send the id back, but in a way the user can't predicatbly change it to have access to someone else's todos
// let data = {
//   id: 4
// };
//
// // 1. Hash the id of 4 so that user can't simply change it to 5 in order to have access to 5's todos
// const token = {
//   data,
//   // 2. Salt the hash--add something, e.g. 'somesecret', to the hash that's unique that changes the value.
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString() // Now if user hashes id of 5, it still won't work
// };
// // Man in the middle attack
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();
// // END of man in the middle attack
//
// const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }

// Instead of the crypto-js library this library has two functions: 1 to create token and 1 to verify it
const jwt = require('jsonwebtoken');

let data = {
  id: 10
};

// Create hash--pass the data and a secret--and returns the token value
let token = jwt.sign(data, '123abc');
console.log(token);

let decoded = jwt.verify(token, '123abc');
console.log('decoded', decoded);
