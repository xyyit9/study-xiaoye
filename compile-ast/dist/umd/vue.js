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

  function compileToRenderFunction(html) {
    console.log(html);
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
      vm.$el = el; // render => template =>el

      if (!options.render) {
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        var render = compileToRenderFunction(template);
        options.render = render;
      }
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

  return Vue;

})));
//# sourceMappingURL=vue.js.map
