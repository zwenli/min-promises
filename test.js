const { resolve } = require('./promise')
const MyPromise = require('./promise')

// const promise1 = new MyPromise(function (resolve) {
//   resolve(2)
// })

// promise1.then((value) => {
//   console.log('promise1 resolve', value)
// }).then((value) => {
//   console.log('then value', value)
//   return 5;
// }).then((value) => {
//   console.log('then3 is ', value)
//   throw new Error(333);
// }).catch(err => {
//   console.log('error is', err)
// })

const promise1 = new Promise(function (resolve) {
  setTimeout(() => {
    resolve(void 0)
  }, 1000);
})

promise1.then(function (value) {
  console.log('2, ', value)
})
