const data = [
  {
    id: 1,
    pid: 0,
  },
  {
    id: 2,
    pid: 0,
  },
  {
    id: 3,
    pid: 2,
  },
  {
    id: 4,
    pid: 1,
  },
  {
    id: 5,
    pid: 1,
  },
  {
    id: 6,
    pid: 4,
  },
]

format(data)

function format(data) {
  const parents = data.filter((i) => {
    return i.pid === 0
  })
  const childrens = data.filter((i) => {
    return i.pid !== 0
  })
  compileTree(parents, childrens)
  function compileTree(parents, childrens) {
    parents.map((p) => {
      childrens.map((c,i) => {
        if (c.pid === p.id) {
            //深拷贝children
            let _childrens = JSON.parse(JSON.stringify(childrens))
            //不包含c本身的c
            _childrens.splice(i,1)
            compileTree([c],_childrens)
          if (p.childrens) {
            p.childrens.push(c)
          } else {
            p.childrens = [c]
          }
        }
      })
    })
  }
  console.log(parents)
  return parents
}
