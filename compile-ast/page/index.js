import Vue from 'vue'

let vm = new Vue({
    el: '#app',
    data(){
        return {
            title: "学生列表",
            classNum:1,
            total:2,
            class:{
                "first": "语文",
                "seconed": "数学"
            },
            teacher: ["张三","李四"],
            students: [
                {id:1,name:"小红"},
                {id:2,name:"小敏"}
            ]
        }
    }
})

vm.total=3;
console.log(vm)