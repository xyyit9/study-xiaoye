import { initState } from './state'
import { compileToRenderFunction } from './compiler'

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this
    //在vue实例上挂载options用户写的对象
    vm.$options = options
    initState(vm)

    if (vm.$options.el) {
      // 执行挂载函数
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this,
      options = vm.$options
    el = document.querySelector(el)
    vm.$el = el
    // render > template > html式
    if (!options.render) {
      let template = options.template

      if (!template && el) {
        // outerHTML是包含自己的node节点
        template = el.outerHTML
      }
      
      const render = compileToRenderFunction(template)
      options.render = render
    }
  }
}

export { initMixin }
