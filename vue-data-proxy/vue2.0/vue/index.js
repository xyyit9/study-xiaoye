import { initState } from "./init";
/*
 *数据劫持的目的，是为了在操作数据的过程中，不只是单纯的数据更改操作,
 *还要添加上页面渲染等操作
 */
function Vue(options) {
  this._init(options);
}

Vue.prototype._init = function (options) {
  var vm = this;
  //在vue实例上挂载options用户写的对象
  vm.$options = options;
  initState(vm);
};

export default Vue;
