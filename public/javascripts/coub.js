function getCoubId (url) {
  const id = url.substring(url.lastIndexOf('/') + 1)
  return id
}

socket.on('received link coub', (link) => {
  console.log(`Coub link: ${link}`)
  player.pauseVideo()
  document.getElementById('coubVideo').style.display = 'block' // hides the frame
  document.getElementById('player').style.display = 'none' // hides the frame

  var myCoub = document.getElementById('coubVideo').contentWindow
  myCoub.postMessage('unmute', '*')
  roomInfo.provider = 'coub'
  loadIframe('coubVideo', getCoubId(link))
})

function loadIframe (iframeName, url) {
  const link = `https://coub.com/embed/${url}?muted=false&autostart=true&originalSize=false&hideTopBar=true&startWithHD=false`
  const $iframe = $(`#${iframeName}`)
  if ($iframe.length) {
    $iframe.attr('src', link)
    return false
  }
  return true
}

$('#provider-coub').on('click', function () {
  socket.emit('coub provider')
  roomInfo.provider = 'coub'
})

socket.on('coub show', () => {
  $('#coub-link-input').attr('placeholder', 'Coub link')

  //  player.pauseVideo()

  document.getElementById('coubVideo').style.display = 'block' // hides the frame
  document.getElementById('player').style.display = 'none' // hides the frame

  var myCoub = document.getElementById('coubVideo').contentWindow
  myCoub.postMessage('unmute', '*')
})

$('#coubHistory').on('click', '.imageHistory', function () {
  socket.emit('history link', $(this).attr('id'))
})
