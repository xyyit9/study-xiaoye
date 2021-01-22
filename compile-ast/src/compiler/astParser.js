/**
 * 生成AST树
 */

// id="app" id='app' id=app
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 标签名 <my-header></my-header>
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
// <my:header></my:header>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// <div
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// > />
const startTagClose = /^\s*(\/?)>/
// </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

function parseHtmlToAst(html) {
  console.log(html)
  let text,
    root,
    currentParent,
    stack = []
  while (html) {
    let textEnd = html.indexOf('<')
    // <尖括号在等于0的位置
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      // 进行type和属性解析 <div id="app" style="color: red; font-size: 20px">
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // 进行结束标签解析 </div>
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    // <尖括号在大于0的位置，说明是文本
    if (textEnd > 0) {
      text = html.substring(0, textEnd)
      if (text) {
        advance(text.length)
        chars(text)
      }
    }
  }

  function parseStartTag() {
    // 匹配<div
    const start = html.match(startTagOpen)
    let end, attr
    if (start) {
      const match = {
        tagName: start[1], //div
        attrs: [],
      }
      // 匹配上的<div就被删除
      advance(start[0].length)
      // 解析属性
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        match.attrs.push({
          name: attr[1],
          /**
           * id="app"  attr[3]为app
           * id='app'  attr[4]为app
           * id=app    attr[5]为app
           *  */
          value: attr[3] || attr[4] || attrs[5],
        })
        advance(attr[0].length)
      }
      // 解析尾括号，<div>的>
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }
  function advance(n) {
    html = html.substring(n)
  }

  function start(tagName, attrs) {
    // console.log('---------开始----------')
    // console.log(tagName, attrs)
    const element = createASTElement(tagName, attrs)
    if (!root) {
      root = element
    }
    // text节点中可以使用
    currentParent = element
    stack.push(element)
  }

  function end(tagName) {
    // console.log('---------结束----------')
    // console.log(tagName)
    const element = stack.pop()
    currentParent = stack[stack.length - 1]
    if (currentParent) {
      element.parent = currentParent
      currentParent.children.push(element)
    }
  }

  function chars(text) {
    // console.log('---------文本----------')
    // console.log(text)
    text = text.trim()
    if (text.length > 0) {
      currentParent.children.push({ type: 3, text })
    }
  }

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1,
      children: [],
      attrs,
      parent,
    }
  }
  console.log(root)
  return root
}

export { parseHtmlToAst }
