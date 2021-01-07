import { userInfoTpl } from './template'

export function observer(userInfo, viewDom) {
  var _strogeInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  var _retInfo = {}

  var init = function () {
    initData(_strogeInfo, _retInfo, userInfo)
    initDom(_retInfo, viewDom)
  }

  function initData(stroageInfo, retInfo, userInfo) {
    for (var k in stroageInfo) {
      if (!userInfo[k]) {
        userInfo[k] = stroageInfo[k]
      }
    }

    for (k in userInfo) {
      ;(function (k) {
        Object.defineProperty(retInfo, k, {
          get() {
            return userInfo[k]
          },
          set(newValue) {
            userInfo[k] = newValue
            localStorage.setItem('userInfo', JSON.stringify(userInfo))
            document.querySelector(`.__${k}`).innerHTML = userInfo[k]
          },
        })
      })(k)
    }
  }

  function initDom(_retInfo, dom) {
    dom.innerHTML = userInfoTpl(_retInfo)
  }

  init()
  return _retInfo
}
