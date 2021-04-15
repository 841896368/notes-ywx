
String.prototype.myTrim = function() {
  return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '')
}
String.prototype.trim = function() {
  return this.replace(/^\s+/, '').replace(/\s+$/, '');
}
String.prototype.trim = function() {
  return  this.replace(/^\s+|\s+$/g, '');
}

function deepClone(obj) {
  if (obj && typeof obj === 'object') {
    let newObj = Array.isArray(obj) ? [] : {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          newObj[key] = deepClone(obj[key])
        } else {
          newObj[key] = obj[key]
        }
      }
    }
    return newObj
  }
  return obj
}

function currying(fn, ...args) {
  if (args.length >= fn.length) {
    return fn(...args)
  } else {
    return function(..._args) {
      return currying(fn, ...args, ..._args)
    }
  }
}

function bigNumAdd(a, b) {
  let maxLength = Math.max(a.length, b.length)
  a = a.padStart(maxlength, '0')
  b = b.padStart(maxLength, '0')
  let t = 0
  let f = 0
  let sum = ''
  for (let i = maxLength - 1; i >= 0; i--) {
    t = parseInt(a[i]) + parseInt(b[i]) + f
    f = Math.floor(t/10)
    sum = t%10 + sum
  }
  if (f === 1) {
    sum = 1 + sum
  }
  return sum
}


const eachFlat = (arr = [], depth = 1) => {
  const result = []
  ;(function flat(arr, depth) {
    arr.forEach(item => {
      if (Array.isArray(item) && depth > 0) {
        flat(item, depth - 1)
      } else {
        result.push(item)
      }
    })
  })(arr, depth)
  return result
}

function flatDeep(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((pre, cur) => pre.concat(Array.isArray(cur) ? flatDeep(cur, depth - 1) : cur), [])
    : arr.slice()
}


function debounce(func, wait) {
  let timeOut
  
  return function() {
    let context = this // this指向绑定事件的元素
    let args = arguments // event事件对象

    clearTimeOut(timeOut)
    timeOut = setTimeout(function() {
      func.apply(context, args)
    }, wait)
  }
}

// 缺点：第一次触发事件不会立即执行fn，需要等delay间隔过后才会执行
function throttle(func, wait) { 
  let timeOut

  return function() {
    let context = this
    let args = arguments

    if (!timeOut) {
      timeOut = setTimeout(function() {
        timeOut = null
        func.apply(context, args)
      }, wait)
    }
  }
}

// 时间戳  缺点：最后一次触发回调与前一次的触发回调的时间差小于delay，则最后一次触发事件不会执行回调
function throttle(func, delay) { 
  let start = Date.now()
  return function() {
    let now = Date.now()
    if (now - start > delay) {
      func.apply(this, arguments)
      start = Date.now()
    }
  }
}

// 方法3:时间戳与定时器结合
function throttle(func, delay) {
  let start = Date.now()
  return function() {
    let now = Date.now()
    let remainTime = delay - (now - start)
    if (remainTime <= 0) {
      func.apply(this, arguments)
      start = Date.now()
    } else {
      setTimeout(() => {
        func.apply(this, arguments)
      }, remainTime)
    }
  }
}




function numFormat(num) {
  return num.toString().replace(/\d+/, function(n) { // 整数部分
    return n.replace(/(\d)(?=(\d{3})+$)/g, function($1) { // 前瞻断言
      return $1 + ','     // 替换捕获组
    })
  })
}

function numFormat(num) {
  num = num.toString().split('.') // 分隔小数点
  let arr = num[0].split('').reverse() // 转换成字符数组并且倒序排列
  let res = []
  for (let i = 0; i < arr.length; i++) {
    if (i%3 === 0 && i !== 0) {
      res.push(',') // 添加分隔符
    }
    res.push(arr[i])
  }
  res.reverse() // 再次倒序成为正确的顺序
  if (num[1]) {
    res = res.join('') + '.' + num[1] // 如果有小数的话添加小数部分
  } else {
    res = res.join('')
  }
  return res
}


var vm = new MyVue({
  id: '#app',
  data: {
    test: 12
  }
})

(function(global) {
  class MyVue {
    constructor(options) {
      this.options = options
      this.initData(options)
      let el = this.options.id
      this.$mount(el)
    }
    initData(options) {
      if (!options.data) return
      this.data = options.data
      new Observer(options.data)
    }
    $mount(el) {
      const updateView = _ => {
        let innerHTML = document.querySelector(el).innerHTML
        let key = innerHTML.match(/{(\w+)}/)[1]
        document.querySelector(el).innerHTML = this.options.data[key]
      }

      new Watcher(updateView, true)
    }
  }
})(window)

class Observer {
  constructor(data) {
    this.walk(data)
  }

  walk(obj) {
    let keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

class Watcher {
  constructor(expOrFn, isRenderWatcher) {
    this.getter = expOrFn
    this.get()
  }

  get() {
    Dep.target = this
    this.getter()
    Dep.target = null
  }
  update() {
    this.get()
  }
}

let uid = 0
class Dep {
  constructor() {
    this.id = uid++
    this.subs = []
  }
  // 依赖收集
  depend() {
    if (Dep.target) {
      // Dep.target是当前watcher,将当前依赖推到subs中
      this.subs.push(Dep.target) 
    }
  }

  // 派发更新
  notify() {
    const subs = this.subs.slice()
    for (let i = 0; i < subs.length; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null

const defineReactive = (obj, key) => {
  const dep = new Dep()
  let val = obj[key]
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      if (Dep.target) {
        dep.depend()
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()
    }
  })
}


Promise.all = function(promises) {
  let result = []
  let promiseCounter = 0
  let promiseLength = promise.length
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promiseLength; i++) {
      Promise.resolve(promises[i]).then(value => {
        result[i] = value
        promiseCounter++
        if (promiseCounter === promiseLength) {
          return resolve(result)         // 尽管我们无法改变一个已经改变过状态的promise，但是reject和resolve都无法让函数剩下的部分暂停执行, https://www.wodecun.com/blog/7871.html
        }
      }, reason => {
        return reject(reason)
      })
    }
  })
}

function toTreeData(arr) {
  let tree = []
  let map = {}
  arr.forEach(item => {
    item.children = []
    map[item.id] = item
  })
  arr.forEach(item => {
    if (item.pid) {
      if (map[item.pid]) {
        map[item.pid].children.push(item)
      }
    } else {
      tree.push(item)
    }
  })
}



class Dep {
  constructor() {
    this.deps = []
  }
  depend(dep) {
    this.deps.push(dep)
  }
  notify() {
    const deps = this.deps.slice()
    for (let i = 0; i < deps.length; i++) {
      queueJob(deps[i])
    }
  }
}

function observe(obj) {
  Object.keys(obj).forEach(item => {
    reactive(obj, item, obj[item])
  })
}

function reactive(obj, key, val) {
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      if (update) {
        dep.depend(update)
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()
    }
  })
}

let update

function watch(fn) {
  update = fn
  update()
  update = null
}

let data = {
  name: '',
  age: ''
}

let queue = []

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    nextTick(flushJobs)
  }
}

const nextTick = cb => Promise.resolve().then(cb)
const flushJobs = () => {
  let job
  while (job = queue.shift()) {
    job()
  }
}

observe(data)

watch(function update() {
  // console.log('触发了更新函数')
})




const arrayProto = Array.prototype // 获取Array的原型
 
function def (obj, key) {
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        value: function(...args) {
            console.log(key); // 控制台输出 push
            console.log(args); // 控制台输出 [Array(2), 7, "hello!"]
            
            // 获取原生的方法
            let original = arrayProto[key];
            // 将开发者的参数传给原生的方法，保证数组按照开发者的想法被改变
            const result = original.apply(this, args);
 
            // do something 比如通知Vue视图进行更新
            console.log('我的数据被改变了，视图该更新啦');
            this.text = 'hello Vue';
            return result;
        }
    });
}
 
// 新的原型
let obj = {
    push() {}
}
 
// 重写赋值
def(obj, 'push');
 
let arr = [0];
 
// 原型的指向重写
arr.__proto__ = obj;
 
// 执行push
arr.push([1, 2], 7, 'hello!');
console.log(arr);


let f = function(param) {
  
}

function f(a) {
  let value = 0
  function fn(b) {
    value += b * b
    fn.value = value
    return fn
  }
  return fn(a)
}

f(1).value // 
f(1)(2)(3).value // 14


function deepClone(obj) {
  let result = Array.isArray(obj) ? [] : {}
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] && typeof obj[key] === 'object') {
          result[key] = deepClone(obj[key]) 
        } else {
          result[key] = obj[key]
        }
      }
    }
  }
  return result
}


function bubbleSort(arr) {
  let len = arr.length
  //外层循环，控制趟数，每一次找到一个最大值
  for (let i = 0; i < len - 1; i++) {
    // 内层循环,控制比较的次数，并且判断两个数的大小
    for (let j = 0; j < len - i -1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
  }
  return arr
}


function createIterator(arr) {
  let i = 0
  return {
    next: function() {
      return {
        value: i < arr.length ? arr[i++] : undefined,
        done: i >= arr.length
      }
    }
  }
}


const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const methodsToPatch = [
  'push',
  'pop',
  'unshift',
  'shift',
  'splice',
  'reverse',
  'sort'
]

methodsToPatch(method => {
  const original = arrayMethods[method]
  Object.defineProperty(arrayMethods, method, {
    configurable: true,
    enumerable: true,
    writable: true,
    value(...args) {
      const result = original.apply(this, args)
      dep.notify()
      return result
    }
  })
})

let arr = []

arr.__proto__ = arrayMethods


function unique(arr) {
  let res = []
  for (let i = 0; i < arr.length; i++) {
    if (res.indexOf(arr[i]) === -1) {
      res.push(arr[i])
    }
  }
  return res
}

function unique(arr) {
  let res = arr.filter((item, index, array) => {
    return array.indexOf(item) === index
  })
  return res
}

function unique(arr) {
  let res = []
  let obj = {}
  for (let i = 0; i < arr.length; i++) {
    if (!obj[typeof arr[i] + JSON.stringify(arr[i])]) {    // 对象的键值只能是字符串,1 和 '1' 会判断为同一个值
      res.push(arr[i])                   // 无法正确区分出两个对象，比如 {value: 1} 和 {value: 2}，因为 typeof item + item 的结果都会是 object[object Object]   
      obj[typeof arr[i] + JSON.stringify(arr[i])] = 1
    }
  }
  return res
}


function unique(arr) {
  return [...new Set(arr)]
}



// (==)转换规则 
// 1、如果有一个操作数是布尔值，则在比较之前先将其转换为数值，false转换为0, true转换为1；
// 2、如果一个操作数是字符串，另一个操作数是数值，则在比较之前先将字符串转换为数值；
// 3、如果一个操作数是对象，另一个操作数不是，则调用对象的 valueOf()/toString() 方法，得到基本类型值按前面的规则进行比较

[] == ![] // true

// [] == ![] -> [] == false -> [] == 0 -> [].toStirng() == 0 -> '' == 0 -> Number('') == 0 -> 0 == 0

{} == !{} // false

// {} == !{} -> {} == false -> {} == 0 -> '[object Object]' == 0 -> Number('[object Object]') == 0 -> NaN == 0


// null == undefined // true
// 要比较相等性之前，不能将null 和 undefined 转换成其他任何值
// 如果有一个操作数是NaN，则相等操作符返回 false ，而不相等操作符返回 true。重要提示：即使两个操作数都是NaN，相等操作符也返回 false了；因为按照规则， NaN 不等于 NaN
// 如果两个操作数都是对象，则比较它们是不是同一个对象，如果两个操作数都指向同一个对象，则相等操作符返回 true；否则， 返回false


Function.prototype.myCall = function(context, ...args) {
  context = context || window
  let fn = Symbol() // 指定唯一属性，防止 delete 删除错误
  context[fn] = this
  let result = context[fn](...args)
  delete context[fn]
  return result
}

Function.prototype.myApply = function(context, args = []) {
  context = context || window
  let fn = Symbol()
  context[fn] = this
  let result = context[fn](...args)
  delete context[fn]
  return result
}

Function.prototype.myBind = function(context, ...args) {
  context = context || window
  let self = this
  return function F(..._args) {
    if (this instanceof F) {
      return new self(...args, ..._args)
    }
    return self.apply(context, args.concat(_args))
  }
}


function _new(Fn, ...args) {
  let obj = {}
  obj.__proto__ = Fn.prototype
  let result = Fn.call(obj, ...args)
  return result instanceof Object ? result : obj
}

function _instanceof(left, right) {
  let prototype = right.prototype
  left = left.__proto__
  while (true) {
    if (left === null) { // 如果为null，说明原型链已经查找到最顶层了，真接返回false
      return false
    }
    if (left === prototype) { // 查找到原型
      return true
    }
    left = left.__proto__  // 继续向上查找
  }
}


// Event Bus
class EventBus {
  constructor() {
    this.task = {}  // 存储事件与回调之间的对应关系
  }

  on(eventName, cb) { // 用于安装事件监听器，它接受目标事件名和回调函数作为参数
    if (!this.task[eventName]) {
      this.task[eventName] = [] // 先检查一下目标事件名有没有对应的监听函数队列, 没有则首先初始化一个监听函数队列
    }
    this.task[eventName].push(cb) // 把回调函数推入目标事件的监听函数队列里去
  }

  emit(eventName, ...args) { // 用于触发目标事件，它接受事件名和监听函数入参作为参数
    let taskQueue = this.task[eventName]
    if (taskQueue && taskQueue.length > 0) {
      taskQueue.forEach(cb => {
        cb(...args) // 逐个调用队列里的回调函数
      })
    }
  }

  off(eventName, cb) { // 移除某个事件回调队列里的指定回调函数
    let taskQueue = this.task[eventName]
    if (taskQueue && taskQueue.length > 0) {
      let index = taskQueue.indexOf(cb)
      index !== -1 && taskQueue.splice(index, 1)
    }
  }

  once(eventName, cb) { // 为事件注册单次监听器
    let callback = (...args) => {
      cb(...args)
      this.off(eventName, callback)
    }
    this.on(eventName, callback)
  }
}



// 0.1 + 0.2
const addNum = (num1, num2) => {
  let len1 = num1.toString().split('.')[1].length
  let len2 = num2.toString().split('.')[1].length
  let m = Math.pow(10, Math.max(len1, len2))
  let result = (Math.round(num1 * m) + Math.round(num2 * m)) / m
  return result
}


function cacheDecorator(fn) {
  let cache = new Map()
  return function(x) {
    if (cache.has(x)) {
      return cache.get(x)
    }
  }
  let result = fn(x)
  cache.set(x, result)
  return result
}

// 缓存函数
function memoize(fn) {
  let cache = {}
  return function(key) {
    if(!cache[key]) {
      cache[key] = fn.apply(this, arguments)
    }
    return cache[key]
  }
}

let memoize = function(func) {
  let cache = {}
  return function(key) {
    return cache[key] || (cache[key] = func.apply(this, arguments))
  }
}

