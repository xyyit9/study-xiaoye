/**
 * AST树转换成render函数
 */
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function generate(el) {
  let children = geChildren(el)
  let code = `_c('${el.tag}', ${
    el.attrs.length > 0 ? `${formatProps(el.attrs)}` : 'undefined'
  }${children ? `,${children}` : ''})`
  return code
}

function geChildren(el) {
  const children = el.children
  if (children) {
    return children.map((c) => generateChild(c)).join(',')
  }
}

function generateChild(node) {
  if (node.type === 1) {
    return generate(node)
  } else if (node.type === 3) {
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }

    let match,
      index,
      lastIndex = (defaultTagRE.lastIndex = 0),
      textArr = []

    // 你好 {{name}} 欢迎
    while ((match = defaultTagRE.exec(text))) {
      index = match.index //3
      if (index > lastIndex) {
        // 你好
        textArr.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      // {{name}}
      textArr.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length //11
    }

    if (lastIndex < text.length) {
      // 欢迎
      textArr.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${textArr.join('+')})`
  }
}

function formatProps(attrs) {
  let attrStr = ''
  for (var i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === 'style') {
      let styleAttrs = {}
      // attr.value的值为string "color: red; font-size: 20px"
      attr.value.split(';').map((styleAttr) => {
        let [key, value] = styleAttr.split(':')
        styleAttrs[key] = value
      })
      // JSON.stringify(styleAttrs)的值为{"color":" red"," font-size":" 20px"}
      // 与attr.value的差异在于，每个key，value值都加上了引号，且有大括号
      attr.value = styleAttrs
    }
    attrStr += `${attr.name}:${JSON.stringify(attr.value)},`
  }

  return `{${attrStr.slice(0, -1)}}`
}

export { generate }
