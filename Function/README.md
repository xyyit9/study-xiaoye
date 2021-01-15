【全网首发:已完结】你不知道的『Function』【知识储备】
https://www.bilibili.com/video/BV1hX4y1M7jo

```javascript
var t1 = new Function('console.log("t1")')
var t2 = Function('console.log("t2")')

console.log(t1.__proto__===Function.prototype) // true
console.log(Function.__proto__ === Function.prototype) // true 
```
第一个输出可以理解，`t1`是`Function`的一个实例对象。但是第二个输出看着费劲，其本质是这样的：
```javascript
function sum(){
    console.log('ts')
}
sum()
console.log(sum.__proto__ === Function.prototype)  // true
```
这里声明了一个`sum`函数，`sum`函数是`Function`的一个实例对象，调用时候用`sum()`。那上面的`Function()`可以如此调用，说明`Function`既是实例函数对象，又是构造方法, 且原型指向是相同的。