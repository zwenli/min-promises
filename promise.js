// ![promises A+ 标准](https://promisesaplus.com/)
var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

/**
 *
 * @param {(resolve, reject) => void} executor
 */
function MyPromise(executor) {
  this.status = PENDING
  this.value = void 0
  this.reason = void 0
  this.onFulfilledCallbacks = []
  this.onRejectCallbacks = []
  var self = this

  function resolve(value) {
    if (self.status === PENDING) {
      self.status = FULFILLED
      self.value = value
      // 2.2.6.1
      for (var i = 0; i < self.onFulfilledCallbacks.length; i += 1) {
        self.onFulfilledCallbacks[i](self.value)
      }
    }
  }

  function reject(reason) {
    if (self.status === PENDING) {
      self.status = REJECTED
      self.reason = reason
      // 2.2.6.2
      for (var i = 0; i < self.onRejectCallbacks.length; i += 1) {
        self.onRejectCallbacks[i](self.reason)
      }
    }
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 2.3.1
  if (promise === x) {
    return reject(
      new TypeError('the promise object and the return value are the same')
    )
  }
  // 2.3.2
  if (x instanceof MyPromise) {
    // 如果 x 为 Promise ，则使 promise 接受 x 的状态
    // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
    x.then(function (y) {
      resolvePromise(promise, y, resolve, reject)
    }, reject)
    return
  }
  // 2.3.3
  if (typeof x === 'function' || (x && typeof x === 'object')) {
    var then
    try {
      // 2.3.3.1
      then = x.then
    } catch (e) {
      // 2.3.3.2
      return reject(e)
    }
    if (typeof then === 'function') {
      var called = false
      try {
        then.call(
          x,
          function (y) {
            // resolvePromise
            // 2.3.3.3.3
            if (called) return
            called = true
            // 2.3.3.3.1
            resolvePromise(promise, y, resolve, reject)
          },
          function (r) {
            // rejectPromise
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (e) {
        // 2.3.3.3.4
        if (called) return // 2.3.3.3.4.1
        reject(e)
      }
    } else {
      // 2.3.3.4
      resolve(x)
    }
  } else {
    // 2.3.4
    resolve(x)
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  var self = this
  var promise2
  // 2.2.1
  if (typeof onFulfilled !== 'function') {
    // 2.2.7.3
    onFulfilled = function (value) {
      return value
    }
  }
  if (typeof onRejected !== 'function') {
    // 2.2.7.4
    onRejected = function (reason) {
      throw reason
    }
  }

  if (this.status === FULFILLED) {
    promise2 = new MyPromise(function (resolve, reject) {
      // 2.2.4, setTimeout保证执行栈为空之后，才会执行onFulfilled
      setTimeout(function () {
        try {
          // 2.2.7.1
          var x = onFulfilled(self.value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          // 2.2.7.2
          reject(e)
        }
      }, 0)
    })
    // 2.2.7
    return promise2
  }
  if (this.status === REJECTED) {
    promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          // 2.2.7.1
          var x = onRejected(self.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          // 2.2.7.2
          reject(e)
        }
      }, 0)
    })
    // 2.2.7
    return promise2
  }
  // 如果状态是PENDING，需要将回掉保存起来
  if (this.status === PENDING) {
    promise2 = new MyPromise(function (resolve, reject) {
      self.onFulfilledCallbacks.push(function () {
        setTimeout(function () {
          try {
            var x = onFulfilled(self.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
      self.onRejectCallbacks.push(function () {
        setTimeout(function () {
          try {
            var x = onRejected(self.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
    })
    return promise2
  }
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}

MyPromise.resolve = function (value) {
  if (value instanceof MyPromise) {
    return value
  }
  return new MyPromise(function (resolve) {
    resolve(value)
  })
}

MyPromise.reject = function (reason) {
  return new MyPromise(function (resolve, reject) {
    reject(reason)
  })
}

// promises-aplus-tests 需要提供此方法
MyPromise.deferred = function () {
  var res = {}
  res.promise = new MyPromise(function (resolve, reject) {
    res.resolve = resolve
    res.reject = reject
  })
  return res
}

module.exports = MyPromise
