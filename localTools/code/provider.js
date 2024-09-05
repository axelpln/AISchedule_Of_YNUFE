
function request(tag, url, data) {
  let ss = ''
  let xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    console.log(xhr.readyState + ' ' + xhr.status)
    if ((xhr.readyState === 4 && xhr.status === 200) || xhr.status === 304) {
      ss = xhr.responseText
    }
  }
  xhr.open(tag, url, false)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send(data)
  return ss
}
// 别忘了加async
async function scheduleHtmlProvider(
  // 此步为必须，用于加载这个工具，后续会增加更多方法
  iframeContent = '',
  frameContent = '',
  dom = document
) {
  //除函数名外都可编辑
  //以下为示例，您可以完全重写或在此基础上更改
  await loadTool('AIScheduleTools')
  // 使用它们的时候务必带上await，否则没有系统alert的时停效果
  let html = ''
  let tag = true
  try {
    let ifs = document.getElementsByTagName('iframe')
    for (const element of ifs) {
      const doms = element
      if (doms.src && doms.src.search('/jsxsd/xskb/xskb_list.do') !== -1) {
        const currDom = doms.contentDocument
        html = currDom.getElementById('kbtable')
          ? currDom.getElementById('kbtable').outerHTML
          : currDom.getElementsByClassName('content_box')[0].outerHTML
        tag = false
      }
    }
    // console.log(ifs.length)
    if (tag) {
      // console.log(ifs.length)
      html = dom.getElementById('kbtable').outerHTML
    }
    return html
  } catch (e) {
    console.error(e)
    await AIScheduleAlert('这是一条提示信息')
    // Prompt的参数比较多，所以传了个对象，最后会返回用户输入的值
    const userInput = await AISchedulePrompt({
      titleText: '提示', // 标题内容，字体比较大，超过10个字不给显示的喔，也可以不传就不显示
      tipText: '这是一条提示信息', // 提示信息，字体稍小，支持使用``达到换行效果，具体使用效果建议真机测试，也可以不传就不显示
      defaultText: '默认内容', // 文字输入框的默认内容，不传会显示版本号，所以空内容要传个''
      validator: value => { // 校验函数，如果结果不符预期就返回字符串，会显示在屏幕上，符合就返回false
        console.log(value)
        if (value === '1') return '这里的结果不可以是1'
        return false
  }})

    let html = request('get', '/jsxsd/xskb/xskb_list.do', null)
    dom = new DOMParser().parseFromString(html, 'text/html')
    return dom.getElementById('kbtable')
      ? dom.getElementById('kbtable').outerHTML
      : dom.getElementsByClassName('content_box')[0].outerHTML
  }
}
