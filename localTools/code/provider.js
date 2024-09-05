
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
    await AIScheduleAlert('未找到课表！请检查是否已打开课表界面后再点击导入！')
    return 'do not continue'
  }
}
