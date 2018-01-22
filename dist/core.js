/*
 * XExtends Core v1.0.0
 *
 * Free open source
 * Author: xu_liangzhan@163.com
 */
(function () {
  'use strict'

  var symbolIterator = 'iterator'

  var global = typeof window === 'undefined' ? this : window

  var __symbolMap = {}
  var __symbolForList = []
  var __incrementId = Math.round(Math.random() * 100)
  var __decrementId = Math.round(Math.random() * 10000)

  function getSymbolIndex (key, type) {
    for (var index = 0, len = __symbolForList.length; index < len; index++) {
      if (key === __symbolForList[index][type]) {
        return index
      }
    }
  }

  /*
    * ES6 不可变的数据类型，用来产生唯一的标识，但是却无法直接访问这个标识
    */
  function XESymbol (key) {
    var value
    if (this && this.constructor === XESymbol) {
      throw new TypeError('Symbol is not a constructor')
    }
    if (__symbolMap.hasOwnProperty(key)) {
      throw new TypeError('Cannot convert a Symbol value to a string')
    }
    __symbolMap[value = 'Symbol(' + key + ') ^xe_' + (__decrementId--) + (__incrementId++) + '' + Math.random()] = key
    return value
  }

  XESymbol.iterator = XESymbol(symbolIterator)

  XESymbol['for'] = function (key) {
    var value
    var index = getSymbolIndex(key, 0)
    if (index === undefined) {
      __symbolForList.push([key, value = XESymbol(key)])
    } else {
      value = __symbolForList[index][1]
    }
    return value
  }

  XESymbol.keyFor = function (key) {
    var index = getSymbolIndex(key, 1)
    if (typeof index === 'number') {
      return __symbolForList[index][0]
    }
    if (!__symbolMap.hasOwnProperty(key)) {
      throw new TypeError(key + ' is not a symbol')
    }
  }

  XESymbol.isSymbol = function (value) {
    return typeof getSymbolIndex(value, 1) === 'number' || __symbolMap.hasOwnProperty(value)
  }

  if (!global.Symbol) {
    global.Symbol = XESymbol
  }

  global.XExtends = {Symbol: XESymbol}
})();

(function () {
  'use strict'

  var errorMessageNullObject = 'Cannot convert undefined or null to object'

  var stringProtos = String.prototype
  var arrayProtos = Array.prototype
  var fnProtos = Function.prototype

  var iteratorIndex = Symbol('Iterator Index')
  var iteratorList = Symbol('Iterator Value')

  var global = typeof window === 'undefined' ? this : window

  function isObject (obj) {
    return obj && typeof obj === 'object'
  }

  function isFunction (obj) {
    return typeof obj === 'undefined'
  }

  function isNumber (obj) {
    return typeof obj === 'number'
  }

  function findItem (list, callback, context, has) {
    for (var index = 0, len = list.length; index < len; index++) {
      if (callback.call(context || global, list[index], index, list)) {
        return {index: index, value: has ? true : list[index]}
      };
    }
    return {index: -1, value: has ? false : has}
  }

  function getArrayIteratorResult (iterator, value) {
    var done = iterator[iteratorIndex]++ >= iterator[iteratorList].length
    return {done: done, value: done ? undefined : value}
  }

  function ArrayEntriesIterator (list) {
    this[iteratorIndex] = 0
    this[iteratorList] = list
    this.next = function () {
      return getArrayIteratorResult(this, [this[iteratorIndex], this[iteratorList][this[iteratorIndex]]])
    }
  }

  function ArrayIndexIterator (list) {
    this[iteratorIndex] = 0
    this[iteratorList] = list
    this.next = function () {
      return getArrayIteratorResult(this, this[iteratorIndex])
    }
  }

  function ArrayValueIterator (list) {
    this[iteratorIndex] = 0
    this[iteratorList] = list
    this.next = function () {
      return getArrayIteratorResult(this, this[iteratorList][this[iteratorIndex]])
    }
  }

  function eachObj (obj, callback, context) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        callback.call(context, obj[key], key, obj)
      }
    }
  }

  function getObjectIterators (obj, getIndex) {
    if (isObject(obj)) {
      var result = []
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          result.push([key, obj[key], [key, obj[key]]][getIndex])
        }
      }
      return result
    }
    throw new TypeError(errorMessageNullObject)
  }

  function toAssignValue (obj) {
    return isObject(obj) || isFunction(obj) ? obj : Array.from(obj)
  }

  /*
    * Object method
    */
  eachObj({
    /*
      * ES5 浅拷贝一个或者多个对象到目标对象中
      *
      * @param Object target 对象
      * @param Object ...
      * @return Object
      */
    assign: function (target) {
      if (target === null || target === undefined) {
        throw new TypeError(errorMessageNullObject)
      }
      target = toAssignValue(target)
      for (var source, index = 1, len = arguments.length; index < len; index++) {
        source = toAssignValue(arguments[index])
        for (var key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key]
          }
        }
      }
      return target
    },

    /*
      * ES6判断两个值是否是相同的值
      *
      * @param Object v1  值
      * @param Object v2  值
      * @return Boolean
      */
    is: function (v1, v2) {
      if (v1 === v2) {
        return v1 !== 0 || 1 / v1 === 1 / v2
      }
      return false
    },

    /*
      * ES5 遍历对象的属性
      *
      * @param Object obj 对象
      * @return Array
      */
    keys: function (obj) {
      return getObjectIterators(obj, 0)
    },

    /*
      * ES8遍历对象的属性值
      *
      * @param Object obj 对象
      * @return Array
      */
    values: function (obj) {
      return getObjectIterators(obj, 1)
    },

    /*
      * ES8 遍历对象的属性名和属性值
      *
      * @param Object obj 对象
      * @return Array
      */
    entries: function (obj) {
      return getObjectIterators(obj, 2)
    },

    /*
      * ES5 在一个对象上定义新的属性或修改现有属性
      *
      * @param Object obj 对象
      * @param Object props 属性
      * @return Object
      */
    defineProperties: function (obj, props) {
      if (obj && (isObject(obj) || isFunction(obj))) {
        if (props === null || props === undefined) {
          throw new TypeError(errorMessageNullObject)
        }
        for (var key in props) {
          if (props.hasOwnProperty(key)) {
            Object.defineProperty(obj, key, props[key])
          }
        }
        return obj
      }
      throw new TypeError('Object.defineProperties called on non-object')
    }
  }, function (fn, name) {
    if (!Object[name]) {
      Object[name] = fn
    }
  })

  /*
    * Function method
    */
  eachObj({

    /*
      * ES5 创建一个新的函数, 当被调用时，将其this关键字设置为提供的值
      *
      * @param Object context 上下文
      * @return Function
      */
    bind: function (context) {
      var fn = this
      return function () {
        return fn.apply(context, arguments)
      }
    }

  }, function (fn, name) {
    if (!fnProtos[name]) {
      fnProtos[name] = fn
    }
  })

  /*
    * Date method
    */
  eachObj({

    /*
      * ES5 返回至今毫秒数
      *
      * @return Number
      */
    now: function () {
      return new Date().getTime()
    }

  }, function (fn, name) {
    if (!Date[name]) {
      Date[name] = fn
    }
  })

  /*
    * Number method
    */
  eachObj({

    /*
      * ES6 检查一个数值是否非无穷
      *
      * @param Number val 数值
      * @return Boolean
      */
    isFinite: function (val) {
      return isNumber(val) && isFinite(val)
    },

    /*
      * ES6 检查一个值是否为 NaN
      *
      * @param Number val 数值
      * @return Boolean
      */
    isNaN: function (val) {
      return isNumber(val) && isNaN(val)
    },

    /*
      * ES6 判断一个值是否为整数
      *
      * @param Number val 数值
      * @return Boolean
      */
    isInteger: function (val) {
      return this.isFinite(val) && Math.floor(val) === val
    }

  }, function (fn, name) {
    if (!Number[name]) {
      Number[name] = fn
    }
  })

  /*
    * String Prototype
    */
  eachObj({

    /*
      * ES5 去除字符串左右两边的空格
      *
      * @return String
      */
    trim: function () {
      return this.trimLeft(this.trimRight())
    },

    /*
      * ES6 去除字符串左边的空格
      *
      * @return String
      */
    trimLeft: function () {
      return this.replace(/^[\s\uFEFF\xA0]+/g, '')
    },

    /*
      * ES6 去除字符串右边的空格
      *
      * @return String
      */
    trimRight: function () {
      return this.replace(/[\s\uFEFF\xA0]+$/g, '')
    },

    /*
      * ES7 判断字符串是否包含该值,成功返回true否则false
      *
      * @param String/Number val 值
      * @return Boolean
      */
    includes: function (val) {
      return this.indexOf(val) !== -1
    },

    /*
      * ES6 判断字符串是否在源字符串的头部
      *
      * @param String/Number val 值
      * @param Number startIndex 开始索引
      * @return Boolean
      */
    startsWith: function (val, startIndex) {
      return (arguments.length === 1 ? this : this.substring(startIndex)).indexOf(val) === 0
    },

    /*
      * ES6 判断字符串是否在源字符串的尾部
      *
      * @param String/Number val 值
      * @param Number startIndex 开始索引
      * @return Boolean
      */
    endsWith: function (val, startIndex) {
      return arguments.length === 1 ? this.indexOf(val) === this.length - 1 : this.substring(0, startIndex).indexOf(val) === startIndex - 1
    },

    /*
      * ES8 用指定字符从前面开始补全字符串
      *
      * @param Number targetLength 结果长度
      * @param Number padString 补全字符
      * @return String
      */
    padStart: function (targetLength, padString) {
      if ((targetLength >> 0) > this.length) {
        padString = String(padString || ' ')
        targetLength -= this.length
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length)
        }
        return padString.slice(0, targetLength) + this
      }
      return String(this)
    },

    /*
      * ES8 用指定字符从后面开始补全字符串
      *
      * @param Number targetLength 结果长度
      * @param Number padString 补全字符
      * @return String
      */
    padEnd: function (targetLength, padString) {
      if ((targetLength >> 0) > this.length) {
        padString = String(padString || ' ')
        targetLength -= this.length
        if (targetLength > padString.length) {
          padString += padString.repeat(targetLength / padString.length)
        }
        return this + padString.slice(0, targetLength)
      }
      return String(this)
    },

    /*
      * ES6 将字符串重复 n次
      *
      * @param Number count 次数
      * @return String
      */
    repeat: function (count) {
      var list = isNaN(count) ? [] : new Array(parseInt(count))
      return list.join(this) + (list.length > 0 ? this : '')
    }

  }, function (fn, name) {
    if (!stringProtos[name]) {
      stringProtos[name] = fn
    }
  })

  /*
    * Array method
    */
  eachObj({

    /*
      * ES6 根据数组或可迭代对象中创建一个新的数组
      *
      * @param Array obj 数组
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Array
      */
    from: function (obj, callback, context) {
      if (obj === null || obj === undefined) {
        throw new TypeError(errorMessageNullObject)
      }
      var result = []
      if (!isNaN(obj.length)) {
        for (var index = 0, len = parseInt(obj.length); index < len; index++) {
          result.push(obj[index])
        }
      }
      return arguments.length < 2 ? result : result.map(callback, context)
    },

    /*
      * ES6 判断对象是否数组
      *
      * @param Object obj 对象
      * @return Boolean
      */
    isArray: function (obj) {
      return obj ? obj.constructor === Array : false
    },

    /*
      * ES6 根据所有参数返回一个新数组
      *
      * @param Object ...
      * @return Array
      */
    'of': function () {
      return Array.prototype.slice.call(arguments)
    }

  }, function (fn, name) {
    if (!Array[name]) {
      Array[name] = fn
    }
  })

  /*
    * Array Prototype
    */
  eachObj({

    /*
      * ES6 返回对数组一个索引值
      *
      * @param Object val 值
      * @param Number
      */
    indexOf: function (val) {
      for (var index = 0, len = this.length; index < len; index++) {
        if (val === this[index]) {
          return index
        };
      }
      return -1
    },

    /*
      * ES6 返回对数组一个索引值,从后往前查找
      *
      * @param Object val 值
      * @param Number
      */
    lastIndexOf: function (val) {
      for (var len = this.length - 1; len >= 0; len--) {
        if (val === this[len]) {
          return len
        };
      }
      return -1
    },

    /*
      * ES7 判断对象是否包含该值,成功返回true否则false
      *
      * @param Object val 值
      * @param Boolean
      */
    includes: function (val) {
      return this.indexOf(val) !== -1
    },

    /*
      * ES6 根据回调迭代数据
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      */
    forEach: function (callback, context) {
      for (var index = 0, len = this.length || 0; index < len; index++) {
        callback.call(context || global, this[index], index, this)
      }
    },

    /*
      * ES6 根据回调过滤数据
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Array
      */
    filter: function (callback, context) {
      for (var result = [], index = 0, len = this.length; index < len; index++) {
        var item = callback.call(context || global, this[index], index, this)
        if (item) {
          result.push(item)
        }
      }
      return result
    },

    /*
      * ES6 指定方法后的返回值组成的新数组
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Array
      */
    map: function (callback, context) {
      for (var result = [], index = 0, len = this.length; index < len; index++) {
        result.push(callback.call(context || global, this[index], index, this))
      }
      return result
    },

    /*
      * ES6 查找匹配第一条数据,如果找不到匹配数据就返回undefined
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Object
      */
    find: function (callback, context) {
      return findItem(this, callback, context).value
    },

    /*
      * ES6 返回对数组一个索引值,如果找不到匹配数据就返回-1
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Number
      */
    findIndex: function (callback, context) {
      return findItem(this, callback, context).index
    },

    /*
      * ES6 对象中的值中的每一项运行给定函数,如果函数对任一项返回true,则返回true,否则返回false
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Boolean
      */
    some: function (callback, context) {
      return findItem(this, callback, context, true).value
    },

    /*
      * ES6 对象中的值中的每一项运行给定函数,如果该函数对每一项都返回true,则返回true,否则返回false
      *
      * @param Function callback(item, index, array) 回调
      * @param Object context 上下文
      * @return Boolean
      */
    every: function (callback, context) {
      for (var index = 0, len = this.length; index < len; index++) {
        if (!callback.call(context || global, this[index], index, this)) {
          return false
        };
      }
      return true
    },

    /*
      * ES6 返回一个Array Iterator对象，该对象包含数组中每一个索引的键值对迭代器
      *
      * @return ArrayEntriesIterator
      */
    entries: function () {
      return new ArrayEntriesIterator(this)
    },

    /*
      * ES6 获取所有索引
      *
      * @return Array
      */
    keys: function () {
      return new ArrayIndexIterator(this)
    },

    /*
      * ES6 接收一个函数作为累加器（accumulator），数组中的每个值（从左到右）开始合并，最终为一个值。
      *
      * @param Function callback(previous, item, index, array) 回调
      * @param Function initialValue 初始值
      * @return Object
      */
    reduce: function (callback, initialValue) {
      var previous = initialValue
      var index = 0
      var len = this.length
      if (typeof initialValue === 'undefined') {
        previous = this[0]
        index = 1
      }
      for (; index < len; index++) {
        previous = callback.call(global, previous, this[index], index, this)
      }
      return previous
    },

    /*
      * ES6 浅复制数组的一部分到同一数组中的另一个位置,数组大小不变
      *
      * @param Number target 复制目标到该位置
      * @param Number start 复制元素的起始位置
      * @param Number end 复制元素的结束位置
      * @return Array
      */
    copyWithin: function (target, start, end) {
      var targetIndex = target >> 0
      var startIndex = start >> 0
      var endIndex = arguments.length > 2 ? end >> 0 : this.length
      if (targetIndex > -1) {
        for (var replaceIndex = 0, replaceArray = this.slice(startIndex, endIndex), len = this.length; targetIndex < len; targetIndex++) {
          if (replaceArray.length <= replaceIndex) {
            break
          }
          this[targetIndex] = replaceArray[replaceIndex++]
        }
      }
      return this
    }
  }, function (fn, name) {
    if (!arrayProtos[name]) {
      arrayProtos[name] = fn
    }
  })

  if (global.Symbol && global.Symbol.iterator) {
    if (!stringProtos[global.Symbol.iterator]) {
      stringProtos[global.Symbol.iterator] = function () {
        for (var list = [], index = 0, len = this.length; index < len; index++) {
          list.push(this.charAt(index))
        }
        return new ArrayValueIterator(list)
      }
    }
    if (!arrayProtos[global.Symbol.iterator]) {
      arrayProtos[global.Symbol.iterator] = function () {
        return new ArrayValueIterator(this)
      }
    }
  }

  /*
    * console
    */
  function output () {
    return arguments.join(' ')
  }

  if (!global.console) {
    global.console = {info: output, error: output, log: output, debug: output, warn: output}
  }
})();

(function () {
  'use strict'

  var promisePendingStatus = 'pending'
  var promiseResolvedStatus = 'resolved'
  var promiseRejectedStatus = 'rejected'

  var promiseStatus = Symbol('Promise Status')
  var promiseValue = Symbol('Promise Value')
  var promiseCallback = Symbol('Promise Callback')
  var promiseThener = Symbol('Promise Thener')

  var global = typeof window === 'undefined' ? this : window

  function executorPromise (promise) {
    if (promise[promiseStatus] !== promisePendingStatus) {
      promise[promiseThener] = promise[promiseThener].filter(function (item) {
        var reason = promise[promiseValue]
        var isException = reason && reason.constructor === PromiseException
        var callback = (isException && item[promiseCallback].exception) || item[promiseCallback][promise[promiseStatus]] || (promise[promiseStatus] === promiseRejectedStatus ? item[promiseCallback].exception : null)
        if (callback) {
          try {
            reason = callback(isException ? reason.message : reason)
          } catch (e) {
            reason = new PromiseException(e)
          } finally {
            updatePromise(item, reason, promiseResolvedStatus)
          }
          return false
        }
        return true
      })
    }
  }

  function updatePromise (promise, reason, status) {
    if (reason && reason.constructor === XEPromise) {
      reason.then(function (val) {
        updatePromise(promise, val, promiseResolvedStatus)
      }, function (val) {
        updatePromise(promise, val, promiseRejectedStatus)
      })
    } else {
      if (promise[promiseStatus] === promisePendingStatus) {
        promise[promiseStatus] = status
        promise[promiseValue] = reason
      }
      executorPromise(promise)
    }
  }

  function PromiseException (e) {
    this.message = e
  }

  function runThen (calls) {
    var promise = new XEPromise(function () {})
    promise[promiseCallback] = calls
    this[promiseThener].push(promise)
    executorPromise(this)
    return promise
  }

  /*
    * ES6 异步操作函数
    */
  function XEPromise (resolver) {
    if (typeof this !== 'object') {
      throw new TypeError('Promises must be constructed via new')
    }

    if (typeof resolver !== 'function') {
      throw new TypeError('Promise resolver undefined is not a function')
    }

    this[promiseValue] = undefined
    this[promiseStatus] = promisePendingStatus
    this[promiseThener] = []

    this.then = function (resolved, rejected) {
      return runThen.call(this, {resolved: resolved, rejected: rejected})
    }

    this['catch'] = function (rejected) {
      return runThen.call(this, {exception: rejected})
    }

    try {
      var that = this
      resolver(function (reason) {
        updatePromise(that, reason, promiseResolvedStatus)
      }, function (reason) {
        updatePromise(that, reason, promiseRejectedStatus)
      })
    } catch (e) {
      updatePromise(this, new PromiseException(e), promiseRejectedStatus)
    }
  }

  ['all', 'race'].forEach(function (name, index) {
    XEPromise[name] = function (iterable) {
      if (iterable[Symbol.iterator]) {
        return new XEPromise(function (resolved, rejected) {
          var completeCount = 0
          var rejectCount = 0
          var isAll = index === 0
          var completeLen = isAll ? iterable.length : 1
          var result = []
          var fulfilled = function (index, reason) {
            result[index] = reason
            if (++completeCount === completeLen) {
              (rejectCount === 0 ? resolved : rejected)(isAll ? result : reason)
            }
          }
          if (iterable.length > 0) {
            iterable.forEach(function (promise, index) {
              if (promise && promise.constructor === XEPromise) {
                promise.then(function (reason) {
                  fulfilled(index, reason)
                }, function (reason) {
                  rejectCount++
                  fulfilled(index, reason)
                })
              } else {
                fulfilled(index, promise)
              }
            })
          } else {
            resolved()
          }
        })
      }
    }
  });

  ['resolve', 'reject'].forEach(function (name, index) {
    XEPromise[name] = function (reason) {
      return new XEPromise(function (resolved, rejected) {
        (index === 0 ? resolved : rejected)(reason)
      })
    }
  })

  if (!global.Promise) {
    global.Promise = XEPromise
  }

  global.XExtends.Promise = XEPromise
})();

(function () {
  'use strict'

  var setmapResult = Symbol('Iterator Result')
  var iteratorIndex = Symbol('Iterator Index')
  var iteratorList = Symbol('Iterator Value')

  var global = typeof window === 'undefined' ? this : window

  function getSetMapIndex (key, entries) {
    for (var result = this[setmapResult], index = 0, len = result.length; index < len; index++) {
      if (key === (entries ? result[index][0] : result[index])) {
        return index
      }
    }
  }

  function SetIterator (list) {
    this[iteratorIndex] = 0
    this[iteratorList] = list
    this.next = function () {
      var index = this[iteratorIndex]++
      return {done: index >= this[iteratorList].length, value: this[iteratorList][index]}
    }
  }

  function MapIterator (list, valueType) {
    this[iteratorIndex] = 0
    this[iteratorList] = list
    this.next = function () {
      var index = this[iteratorIndex]++
      var result = {done: index >= this[iteratorList].length, value: this[iteratorList][index]}
      if (!result.done) {
        if (valueType === 0) {
          result.value = result.value[0]
        } else if (valueType === 1) {
          result.value = result.value[1]
        } else {
          result.value = result.value
        }
      }
      return result
    }
  }

  function addSet (value) {
    var result = this[setmapResult]
    var index = getSetMapIndex.call(this, value)
    if (index === undefined) {
      result.push(value)
    } else {
      result[index] = value
    }
  }

  function deleteSet (value) {
    var index = getSetMapIndex.call(this, value)
    return index === undefined ? false : this[setmapResult].splice(index, 1)
  }

  function setMap (key, value) {
    var result = this[setmapResult]
    var index = getSetMapIndex.call(this, key, true)
    if (index === undefined) {
      result.push([key, value])
    } else {
      result[index][1] = value
    }
  }

  function deleteMap (key) {
    var index = getSetMapIndex.call(this, key, true)
    return index === undefined ? false : this[setmapResult].splice(index, 1)
  }

  function isWeakKey (value) {
    return value && typeof value !== 'number' && typeof value !== 'string'
  }

  function getSize () {
    return this[setmapResult].length
  }

  /*
    * ES6 有序列表集合,它不会包含重复项
    *
    * @prototype add(value) 添加某个值,返回Set结构本身
    * @prototype has(value) 返回一个布尔值，表示该值是否为Set的成员
    * @prototype delete(value) 删除某个值，返回一个布尔值，表示删除是否成功
    * @prototype clear() 清除所有成员，没有返回值
    * @prototype forEach(callback, context) 使用回调函数遍历每个成员
    * @prototype entries() 返回一个键值对的遍历器
    * @prototype values() 返回一个键值的遍历器
    * @prototype keys() 返回一个键名的遍历器
    * @prototype Number size 返回Set实例的成员总数
    */
  function XESet (initList) {
    this[setmapResult] = []

    initList && initList.forEach(function (item) {
      this[setmapResult].push(item)
    }, this)

    this.size = getSize.call(this)
  }

  Object.assign(XESet.prototype, {

    add: function (value) {
      addSet.call(this, value)
      this.size = getSize.call(this)
      return this
    },

    'delete': function (value) {
      var result = deleteSet.call(this, value)
      this.size = getSize.call(this)
      return result
    },

    forEach: function (callback, context) {
      this[setmapResult].forEach(callback, context)
    }

  })

  /*
    * ES6 列表集合,和Set一样,只不过它的值只能是非空对象
    *
    * @prototype add(value) 添加某个值,返回Set结构本身
    * @prototype has(value) 返回一个布尔值，表示该值是否为Set的成员
    * @prototype delete(value) 删除某个值，返回一个布尔值，表示删除是否成功
    */
  function XEWeakSet () {
    this[setmapResult] = []

    this.add = function (value) {
      if (isWeakKey(value)) {
        addSet.call(this, value)
      }
      return this
    }

    this['delete'] = deleteSet
  }

  /*
    * ES6 有序键值对集合,键值对的 key和 value都可以是任何类型的元素
    *
    * @prototype Function set(key, value) 添加某个键值对,返回WeakMap结构本身
    * @prototype Function get(key) 返回键 对应的值
    * @prototype Function has(key) 返回一个布尔值，表示该键是否为Map的成员
    * @prototype Function delete(key) 删除某个键值，返回一个布尔值，表示删除是否成功
    * @prototype Function clear() 清除所有成员，没有返回值
    * @prototype Function forEach(callback, context) 使用回调函数遍历每个成员
    * @prototype Function entries() 返回一个键值对的遍历器
    * @prototype Function values() 返回一个键值的遍历器
    * @prototype Function keys() 返回一个键名的遍历器
    * @prototype Number size 返回Map实例的成员总数
    */
  function XEMap (initList) {
    this[setmapResult] = []

    initList && initList.forEach(function (item) {
      this[setmapResult].push([item[0], item[1]])
    }, this)

    this.size = getSize.call(this)
  }

  Object.assign(XEMap.prototype, {

    set: function (key, value) {
      setMap.call(this, key, value)
      this.size = getSize.call(this)
      return this
    },

    'delete': function (key) {
      var result = deleteMap.call(this, key)
      this.size = getSize.call(this)
      return result
    },

    forEach: function (callback, context) {
      this[setmapResult].forEach(function (item) {
        callback.call(context, item[1], item[0], item)
      })
    },

    entries: function () {
      return new MapIterator(this[setmapResult])
    },

    keys: function () {
      return new MapIterator(this[setmapResult], 0)
    },

    values: function () {
      return new MapIterator(this[setmapResult], 1)
    }

  })

  /*
    * ES6 键值对集合,和Map一样,只不过 它的 key只能是非空对象
    *
    * @prototype Function set(key, value) 添加某个键值对,返回WeakMap结构本身
    * @prototype Function get(key) 返回键 对应的值
    * @prototype Function has(key) 返回一个布尔值，表示该键是否为Map的成员
    * @prototype Function delete(key) 删除某个键值，返回一个布尔值，表示删除是否成功
    */
  function XEWeakMap () {
    this[setmapResult] = []

    this.set = function (key, value) {
      if (isWeakKey(key)) {
        setMap.call(this, key, value)
      }
      return this
    }

    this['delete'] = deleteMap
  }

  var setProtos = XESet.prototype
  var weaksetProtos = XEWeakSet.prototype
  var mapProtos = XEMap.prototype
  var weakmapProtos = XEWeakMap.prototype

  setProtos.keys = setProtos.entries = setProtos.values = function () {
    return new SetIterator(this[setmapResult])
  }

  setProtos.clear = mapProtos.clear = function () {
    this[setmapResult].length = 0
    this.size = getSize.call(this)
  }

  weaksetProtos.has = setProtos.has = function (value) {
    return getSetMapIndex.call(this, value) !== undefined
  }

  weakmapProtos.has = mapProtos.has = function (key) {
    return getSetMapIndex.call(this, key, true) !== undefined
  }

  weakmapProtos.get = mapProtos.get = function (key) {
    var index = getSetMapIndex.call(this, key, true)
    return index === undefined ? undefined : this[setmapResult][index][1]
  }

  if (global.Symbol && global.Symbol.iterator) {
    setProtos[global.Symbol.iterator] = setProtos.values
    mapProtos[global.Symbol.iterator] = mapProtos.entries
  }

  [['Set', XESet], ['WeakSet', XEWeakSet], ['Map', XEMap], ['WeakMap', XEWeakMap]].forEach(function (item) {
    if (!global[item[0]]) {
      global[item[0]] = item[1]
    }
    global.XExtends[item[0]] = item[1]
  })
})()
