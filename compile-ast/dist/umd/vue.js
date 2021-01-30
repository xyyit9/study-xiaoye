(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function proxyData(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function defineReactiveData(data, key, value) {
    // value可能也是一个对象
    observe(value);
    Object.defineProperty(data, key, {
      get: function get() {
        console.log("响应式数据：获取", value);
        return value;
      },
      set: function set(newValue) {
        console.log("响应式数据：设置", value);
        if (newValue == value) return; // newValue可能也是一个对象

        observe(newValue);
        value = newValue;
      }
    });
  }

  function observeArr(arr) {
    for (var i = 0; i < arr.length; i++) {
      observe(arr[i]);
    }
  }

  //所有会改变原数组内容的原生方法
  var ARR_METHODS = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];

  /* 重写Array原型链上所有可能改变原数组的方法
  *  push新增的对象可能是对象或者数组，所以也需要进行观察，
  *  原数组数据的更改，可能引起页面视图改变，所以也要观察
  */

  var originArrMethods = Array.prototype; // 创建新的对象实例，arrMthods的原型为originArrMethods

  var arrMethods = Object.create(originArrMethods);
  ARR_METHODS.map(function (m) {
    arrMethods[m] = function () {
      // arguments是类数组，Array.prototype.slice.call生成一个数组
      var args = Array.prototype.slice.call(arguments); // 原来数组的功能仍然需要保证
      // this指向调用数组方法本身的对象，例如[1,2,3].splice(0,1,3),this就指向[1,2,3]

      var rt = originArrMethods[m].apply(this, args);
      var newArr;

      switch (m) {
        case "push":
        case "unshift":
          newArr = args;
          break;

        case "splice":
          newArr = args.slice(2);
          break;
      } // newArr是一个数组，所以可以直接observeArr进行递归，而不需要进入到observe流程


      newArr && observeArr(newArr);
      return rt;
    };
  });

  function Observer(data) {
    if (Array.isArray(data)) {
      // 覆盖原本的__proto__
      data.__proto__ = arrMethods; // data是数组，数组内部可能出现对象或者数组，所以需要对数组内部每一项进行观察

      observeArr(data);
    } else {
      this.walk(data);
    }
  }

  Observer.prototype.walk = function (data) {
    var keys = Object.keys(data);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = data[key];
      defineReactiveData(data, key, value);
    }
  };

  function observe(data) {
    if (_typeof(data) !== 'object' || data === null) return;
    new Observer(data);
  }

  function initState(vm) {
    var options = vm.$options;

    if (options.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    // 不污染用户原本的data
    var data = vm.$options.data; // data原本是一个方法，执行后可以通过vm._data.xxx这样获取

    data = typeof data === "function" ? data.call(vm) : data || {};
    vm._data = data;

    for (var key in data) {
      // 将对象访问从vm._data.xxx变成vm.xxx的形式
      proxyData(vm, '_data', key);
    } // 观察者模式_data


    observe(vm._data);
  }

  /**
   * 生成AST树
   */
  // id="app" id='app' id=app
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 标签名 <my-header></my-header>

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // <my:header></my:header>

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <div

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // > />

  var startTagClose = /^\s*(\/?)>/; // </div>

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));

  function parseHtmlToAst(html) {
    console.log(html);
    var text,
        root,
        currentParent,
        stack = [];

    while (html) {
      var textEnd = html.indexOf('<'); // <尖括号在等于0的位置

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); // 进行type和属性解析 <div id="app" style="color: red; font-size: 20px">

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 进行结束标签解析 </div>


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      } // <尖括号在大于0的位置，说明是文本


      if (textEnd > 0) {
        text = html.substring(0, textEnd);

        if (text) {
          advance(text.length);
          chars(text);
        }
      }
    }

    function parseStartTag() {
      // 匹配<div
      var start = html.match(startTagOpen);
      var end, attr;

      if (start) {
        var match = {
          tagName: start[1],
          //div
          attrs: []
        }; // 匹配上的<div就被删除

        advance(start[0].length); // 解析属性

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],

            /**
             * id="app"  attr[3]为app
             * id='app'  attr[4]为app
             * id=app    attr[5]为app
             *  */
            value: attr[3] || attr[4] || attrs[5]
          });
          advance(attr[0].length);
        } // 解析尾括号，<div>的>


        if (end) {
          advance(end[0].length);
          return match;
        }
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function start(tagName, attrs) {
      // console.log('---------开始----------')
      // console.log(tagName, attrs)
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      } // text节点中可以使用


      currentParent = element;
      stack.push(element);
    }

    function end(tagName) {
      // console.log('---------结束----------')
      // console.log(tagName)
      var element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    }

    function chars(text) {
      // console.log('---------文本----------')
      // console.log(text)
      text = text.trim();

      if (text.length > 0) {
        currentParent.children.push({
          type: 3,
          text: text
        });
      }
    }

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        type: 1,
        children: [],
        attrs: attrs,
        parent: parent
      };
    }

    console.log(root);
    return root;
  }

  /**
   * AST树转换成render函数
   */
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function generate(el) {
    var children = geChildren(el);
    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length > 0 ? "".concat(formatProps(el.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  function geChildren(el) {
    var children = el.children;

    if (children) {
      return children.map(function (c) {
        return generateChild(c);
      }).join(',');
    }
  }

  function generateChild(node) {
    if (node.type === 1) {
      return generate(node);
    } else if (node.type === 3) {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      }

      var match,
          index,
          lastIndex = defaultTagRE.lastIndex = 0,
          textArr = []; // 你好 {{name}} 欢迎

      while (match = defaultTagRE.exec(text)) {
        index = match.index; //3

        if (index > lastIndex) {
          // 你好
          textArr.push(JSON.stringify(text.slice(lastIndex, index)));
        } // {{name}}


        textArr.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length; //11
      }

      if (lastIndex < text.length) {
        // 欢迎
        textArr.push(JSON.stringify(text.slice(lastIndex)));
      }

      return "_v(".concat(textArr.join('+'), ")");
    }
  }

  function formatProps(attrs) {
    var attrStr = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          var styleAttrs = {}; // attr.value的值为string "color: red; font-size: 20px"

          attr.value.split(';').map(function (styleAttr) {
            var _styleAttr$split = styleAttr.split(':'),
                _styleAttr$split2 = _slicedToArray(_styleAttr$split, 2),
                key = _styleAttr$split2[0],
                value = _styleAttr$split2[1];

            styleAttrs[key] = value;
          }); // JSON.stringify(styleAttrs)的值为{"color":" red"," font-size":" 20px"}
          // 与attr.value的差异在于，每个key，value值都加上了引号，且有大括号

          attr.value = styleAttrs;
        })();
      }

      attrStr += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(attrStr.slice(0, -1), "}");
  }

  function compileToRenderFunction(html) {
    var ast = parseHtmlToAst(html);
    var code = generate(ast);
    var render = new Function("with(this){ return ".concat(code, "}"));
    return render;
  }

  function patch(oldNode, vNode) {
    var el = createElement(vNode),
        parentElement = oldNode.parentNode;
    parentElement.insertBefore(el, oldNode.newSibling);
    parentElement.removeChild(oldNode);
  } //将vnode生成真实的dom节点


  function createElement(vnode) {
    var tag = vnode.tag,
        props = vnode.props,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      updateProps(vnode);
      children.map(function (child) {
        vnode.el.appendChild(createElement(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function updateProps(vnode) {
    var el = vnode.el,
        newProps = vnode.props || {};

    for (var key in newProps) {
      if (key === 'style') {
        for (var sKey in newProps.style) {
          el.style[sKey] = newProps.style[sKey];
        }
      } else if (key === 'class') {
        el.className = el["class"];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function mountComponent(vm) {
    vm._update(vm._render());
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this; //传入真实的dom节点，和新的虚拟dom节点

      patch(vm.$el, vnode);
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this; //在vue实例上挂载options用户写的对象

      vm.$options = options;
      initState(vm);

      if (vm.$options.el) {
        // 执行挂载函数
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this,
          options = vm.$options;
      el = document.querySelector(el);
      console.log('el', el);
      vm.$el = el; // render > template > html式

      if (!options.render) {
        var template = options.template;

        if (!template && el) {
          // outerHTML是包含自己的node节点
          template = el.outerHTML;
        }

        var render = compileToRenderFunction(template);
        options.render = render;
      }

      mountComponent(vm);
    };
  }

  function createElement$1(tag) {
    var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    return vnode(tag, attrs, children);
  }

  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, text);
  }

  function vnode(tag, props, children, text) {
    return {
      tag: tag,
      props: props,
      children: children,
      text: text
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      return createElement$1.apply(void 0, arguments);
    };

    Vue.prototype._s = function (value) {
      if (value == undefined) return;
      return _typeof(value) === 'object' ? JSON.stringify(value) : value;
    };

    Vue.prototype._v = function (text) {
      return createTextVnode(text);
    };

    Vue.prototype._render = function () {
      var vm = this,
          render = vm.$options.render;
      var vnode = render.call(vm);
      console.log('vnode', vnode);
      return vnode;
    };
  }

  /*
   *数据劫持的目的，是为了在操作数据的过程中，不只是单纯的数据更改操作,
   *还要添加上页面渲染等操作
   */

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
