export function userInfoTpl(info) {
  return `
    <h1>姓名：<span class = "__username">${info.username || '未录入'}</span>
    <h1>年龄：<span class = "__age">${info.age || '未录入'}</span>
    <h1>邮箱：<span class = "__email">${info.email || '未录入'}</span>
    <h1>电话：<span class = "__tel">${info.tel || '未录入'}</span>
  `
}
