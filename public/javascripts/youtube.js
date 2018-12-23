var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

console.log(tag)

function getYoutubeId(url) {
  var ID = ''
  url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
  if (url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i)
    ID = ID[0]
  } else {
    ID = url
  }
  return ID
}

var player

function onYouTubeIframeAPIReady() {
  console.log('Youtube iframe loaded')
  player = new YT.Player('player', {
    height: '800',
    width: '600',
    videoId: 'n8ve4k8IyTk',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}

function onPlayerReady(event) {
  event.target.seekTo(15)
  event.target.pauseVideo()
}

function onPlayerStateChange(event) {
  socket.emit('youtube event', event, player.getCurrentTime())
}

function stopVideo() {
  player.stopVideo()
}

function sync() {
  socket.emit('youtube sync', player.getCurrentTime())
}

socket.on('received link youtube', (link) => {
  console.log(`Youtube link: ${link}`)
  var myCoub = document.getElementById('coubVideo').contentWindow
  myCoub.postMessage('mute', '*')
  document.getElementById('coubVideo').style.display = 'none' // hides the frame
  document.getElementById('player').style.display = 'block' // hides the frame
  player.playVideo()
  roomInfo = 'youtube'
  player.loadVideoById(getYoutubeId(link))
})

socket.on('youtube pause', () => {
  player.pauseVideo()
})

socket.on('youtube buffering', (currentTime) => {
  //  player.seekTo(currentTime, false)
  //  player.playVideo()
  sync()
})

socket.on('youtube play', (time) => {
  player.playVideo()
})

$('#provider-youtube').on('click', function () {
  socket.emit('youtube provider')
  roomInfo.provider = 'youtube'
})

socket.on('youtube show', () => {
  $('#coub-link-input').attr('placeholder', 'Youtube link')
  var myCoub = document.getElementById('coubVideo').contentWindow
  myCoub.postMessage('mute', '*')
  document.getElementById('coubVideo').style.display = 'none' // hides the frame
  document.getElementById('player').style.display = 'block' // hides the frame
  // player.playVideo()
})

socket.on('youtube sync', (time) => {
  player.seekTo(time)
})
