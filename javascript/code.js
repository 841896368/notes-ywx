
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

// 参数复用、提前返回和 延迟执行
function currying(fn, ...args) {
  if (args.length >= fn.length) {
    return fn(...args)
  } else {
    return function(..._args) {
      return currying(fn, ...args, ..._args)
    }
  }
}

var foo = function(...args) {
  var fn = (..._args) => foo(...args, ..._args)
  fn.getValue = () => args.reduce((pre, cur) => pre + cur)
  return fn
}

var f = foo(1,2,3)
f.getValue() // 6

var f = foo(1)(2)(3)
f.getValue() // 6

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
  let bound = function(..._args) {
    if (this instanceof bound) {
      return new self(...args, ..._args)
    }
    return self.apply(context, args.concat(_args))
  }
  return bound
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
    this.cache = {}  // 存储事件与回调之间的对应关系
  }

  on(name, cb) { // 用于安装事件监听器，它接受目标事件名和回调函数作为参数
    if (!this.cache[name]) {
      this.cache[name] = [] // 先检查一下目标事件名有没有对应的监听函数队列, 没有则首先初始化一个监听函数队列
    }
    this.task[name].push(cb) // 把回调函数推入目标事件的监听函数队列里去
  }

  emit(name, ...args) { // 用于触发目标事件，它接受事件名和监听函数入参作为参数
    if (this.cache[name]) {
      let tasks = this.cache[name].slice() // 浅拷贝
      tasks.forEach(cb => {
        cb(...args) // 逐个调用队列里的回调函数
      })
    }
  }

  off(name, cb) { // 移除某个事件回调队列里的指定回调函数
    let tasks = this.cache[name]
    if (tasks) {
      let index = tasks.indexOf(cb)
      index !== -1 && tasks.splice(index, 1)
    }
  }

  once(name, cb) { // 为事件注册单次监听器
    let callback = (...args) => {
      cb(...args)
      this.off(name, callback)
    }
    this.on(name, callback)
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

function generateRandomWords(n) {
  let words = 'abcdefghijklmnopqrstuvwxyz你是好的嗯气短前端后端设计产品网但考虑到付款啦分手快乐的分类'
  let result = ''
  let len = words.length
  for (let i = 0; i < n; i++) {
    result += words[Math.floor(Math.random() * len)]
  }
  return result
}

// 1、懒加载 + 分页
// 2、虚拟滚动技术

// 虚拟列表是按需显示的一种实现，即只对可见区域进行渲染，对非可见区域中的数据不渲染或部分渲染的技术，从而达到极高的渲染性能


// 浏览器的渲染机制
// 1、解析HTML，生成DOM树，解析CSS，生成CSSOM树
// 2、将DOM树和CSSOM树结合，生成渲染树(Render Tree)
// 3、Layout(回流):根据生成的渲染树，进行回流(Layout)，得到节点的几何信息（位置，大小）
// 4、Painting(重绘):根据渲染树以及回流得到的几何信息，得到节点的绝对像素
// 5、Display:将像素发送给GPU，展示在页面上。


Array.prototype.reduce = function (callback, pre) {
  if (typeof callback !== 'function') {
    throw '必须为函数'
  }
  if (!Array.isArray(this)) {
    throw '必须为数组'
  }
  let index = 0
  if (!pre) {
    index = 1
    pre = this[0]
  }
  for (; index < this.length; index++) {
    pre = callback(pre, this[index], index, this)
  }
  return pre
}

// 二分查找 时间复杂度 O(logn)
function binarySearch(arr, key) {
  let low = 0
  let high = arr.length - 1
  while (low <= high) {
    let mid = Math.floor((low + high) / 2)
    if (key === arr[mid]) {
      return mid
    } else if (key > arr[mid]) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return -1
}

function binarySearch(arr, low, high, key) {
  if (low > high) {
    return -1
  }
  let mid = Math.floor((low + high) / 2)
  if (key === arr[mid]) {
    return mid
  } else if (key < arr[mid]) {
    high = mid - 1
    return binarySearch(arr, low, high, key)
  } else if (key > arr[mid]) {
    low = mid + 1
    return binarySearch(arr, low, high, key)
  }
}

// 链表
class Node {
  constructor(key) {
    this.next = null
    this.key = key
  }
}

class List {
  constructor() {
    this.head = null // 每个链表都有一个头指针，指向第一个节点，没节点则指向NULL
  }
  // 创建节点
  static createNode() {
    return new Node(key)
  }
  // 插入节点
  insert(node) {
    if (this.head) {
      node.next = this.head
    } else {
      node.next = null
    }
    this.head = node
  }
  // 搜索节点
  find(key) {
    let node = this.head
    while (node !== null && node.key !== key) {
      node = node.next
    }
    return node
  }
  // 删除节点
  delete(node) {
    if (node === this.head) {
      this.head = node.next
      return
    }
    // 查找所要删除节点的上一个节点
    let prevNode = this.head
    while (prevNode.next !== node) {
      prevNode = prevNode.next
    }

    if (node.next === null) {
      prevNode.next = null
    }

    if (node.next) {
      prevNode.next = node.next
    }
  }
}

// 反转链表
const reverseList = function(head) {
  let prev = null
  let cur = head
  while (cur) {
    const next = cur.next
    cur.next = prev
    prev = cur
    cur = next
  }
  return prev
}

// 斐波那契数列, 时间复杂度 O(n)
const fib = function(n) {
  let a = 0
  let b = 1
  while (n > 0) {
    [a, b] = [b, a + b]
    n--
  }
  return a
}

// 时间复杂度 O(n^2)
const fib = function(n) {
  if (n <= 1) {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}

// 尾递归，在递归过程中，直接把计算结果作为参数传入到递归方法中，也就是说，递归过程中不需要保存之前的计算值, 时间复杂度 O(n)
const fib = function(n, a = 0, b = 1) {
  if (n < 1) {
    return a
  }
  return fib(n - 1, b, a + b)
}

// LRU缓存机制 Least Recently Used的缩写，即最近最少使用
// 选择最近最久未使用的页面予以淘汰。该算法赋予每个页面一个访问字段，用来记录一个页面自上次被访问以来
// 所经历的时间 t，当须淘汰一个页面时，选择现有页面中其t 值最大的，即最近最少使用的页面予以淘汰。
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity // 容量
    this.cache = new Map()
  }
  get(key) {
    if (this.cache.has(key)) {
      const temp = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, temp)
      return temp
    }
    return -1
  }
  set(key, value) {
    if (this.cache.has(key)) { // key存在，仅修改值
      this.cache.delete(key)
      this.cache.set(key, value)
    } else if (this.cache.size < this.capacity) { // key不存在，cache未满
      this.cache.set(key, value)
    } else { // 添加新key，删除map的第一个元素，即为最长未使用的
      // Set、Map 的遍历顺序就是插入顺序 Map.prototype.keys() 返回键名遍历器 MapIterator.next()返回 {value: xxx, done: false}
      this.cache.delete(this.cache.keys().next().value) 
      this.cache.set(key, value)
    }
  }
}

// vue
// 1、Vue生命周期、vue生态、vue-router 基础原理、vue-router（router 404页面的配置）
// 2、vue双向绑定原理：Object.defineProperty，发布订阅模式 ，promise ，finally v-model 加到自定义组件。怎么做 ref 放在组件，vue nextTick 原理、大列表处理，事件委托方法
// 3、vuex ：event_bus 是否使用过，vue 组件库
// 4、基本组件间数据通信的方式、Vue中父子组件之间更新流程、动态组件、v-model 、http状态码、协商缓存、js基础API 
// 5、computed与watch的区别、vue created 和 mounted 顺序、
// 6、修饰符、自定义指令、slot、，vuex,指令、mixin，常用命令的工作原理、
// 7、vue几个拔高的问题，比如虚拟dom，diff算法简介等
// 8、工具类：webpack、git使用是否只会基本的拉取
// js
// 9、服务端渲染
// 10、异步请求：值传递和引用传递、es5 this指向
// 13、var和let的区别，为什么会有这样的区别
// 14、js数据类型，值类型、引用类型
// 15、冒泡、冒泡排序流程、代码流程、 原型链、闭包是什么、如何处理闭包、es6.浏览器控制台常见报错是否认识，请求错误码有哪些、组件封装，前端安全
// 16、js基础：基本的GET/POST请求的差异、Promise的很多方法及原理
// 17、前端缓存说出localstorage，sessionstorage，cookie的区别
// 18、js原型链如何实现继承、事件循环机制、异步机制
// 19、ES6 promise是否用过，JS模块化的理解，defer和async的区别----考知识领域拓展 
// 20、setTimeout 的执行，主线程和异步线程
// 22、CSS：基本的CSS选择器优先级、 css3动画放大，旋转，移动相关属性、动画性能优化、弹性盒布局、css如何处理 1px 问题，是否知道动画做 js
// 23、CSS：移动端：刘海屏适配规则、position基本概念、Positon的几种参数、fix深入理解（fix的低端浏览器兼容问题，使用JS进行模拟fix的思路）
// 24、网页布局模式、浏览器渲染模式、重绘和重排的概念


