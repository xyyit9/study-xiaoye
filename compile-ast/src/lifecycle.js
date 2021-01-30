import {patch} from './vdom/patch'

function mountComponent(vm) {
    vm._update(vm._render())
}

function lifecycleMixin(Vue) {
    Vue.prototype._update = function(vnode){
        const  vm = this;
        //传入真实的dom节点，和新的虚拟dom节点
        patch(vm.$el, vnode)
    }
}
export { lifecycleMixin, mountComponent }
