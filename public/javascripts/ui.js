/* global Cookies */
/* global UIkit */
/* global getCoubId */
/* global YT */

var isYTrdy = false

function getCoubId (url) {
  const id = url.substring(url.lastIndexOf('/') + 1)
  return id
}

function getYoutubeId (url) {
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

function onYouTubeIframeAPIReady () {
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

function onPlayerReady (event) {
  isYTrdy = true
  event.target.seekTo(15)
  event.target.pauseVideo()
}

function onPlayerStateChange (event) {
  socket.emit('youtube event', event, player.getCurrentTime())
}

function stopVideo () {
  player.stopVideo()
}

function sync () {
  socket.emit('youtube sync', player.getCurrentTime())
}

$(document).ready(() => {
  if (document.cookie.indexOf('username=') === -1) {
    UIkit.modal('#modal-username', {
      modal: false,
      keyboard: false,
      bgclose: false,
      center: true
    }).show()
  } else {
    socket.emit('username', Cookies.get('username'))
  }
  $('#player').hide()
  $('#left-button').on('click', function () {

  })
  $('#right-button').on('click', function () {

  })

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
    //player.playVideo()
  })

  socket.on('youtube sync', (time) => {
    player.seekTo(time)
  })

  $('#coubHistory').on('click', '.imageHistory', function () {
    socket.emit('history link', $(this).attr('id'))
  })

  $('#username-button').click(() => {
    if ($.trim($('#username-input').val()) === '') {
      UIkit.notification('Username cannot be blank!', {
        status: 'warning',
        pos: 'bottom-center'
      })
      $('#username-input').addClass('uk-form-danger')
      return true
    }

    socket.emit('username', $('#username-input').val())
    Cookies.set('username', $('#username-input').val(), { expires: 7 })
    UIkit.modal('#modal-username').hide()
    // location.reload();
    return false
  })

  $('#username-change-button').click(() => {
    UIkit.modal('#modal-username', {
      modal: false,
      keyboard: false,
      bgclose: false,
      center: true
    }).show()
  })

  $('#enter-button').click(() => {
    if ($.trim($('#coub-link-input').val()) === '') {
      $('#coub-link-input').removeClass('uk-form-success')
      $('#coub-link-input').addClass('uk-form-danger')
      UIkit.notification('Link cannot be blank!', {
        status: 'warning',
        pos: 'bottom-center'
      })
      return true
    }
    $('#coub-link-input').removeClass('uk-form-danger')
    $('#coub-link-input').addClass('uk-form-success')
    socket.emit('sent link', $('#coub-link-input').val())
    $('#coub-link-input').val('')
    return false
  })
  $('#rng-button').click(() => {
    //    const link = Math.random().toString(36).substr(2, Math.floor(Math.random() * (6 - 4 + 1) + 4));
    console.log(roomInfo.provider)
    
    if (roomInfo.provider == 'coub' || roomInfo.provider == null) {
      socket.emit('rng coub')
    }

    if (roomInfo.provider == 'youtube') {
      socket.emit('rng youtube')
    }
    /* $('#coub-link-input').val(link);
    $('#coub-link-input').val(''); */
  })
  $('#coub-link-input').keydown(event => {
    if (event.keyCode === 13) {
      if ($.trim($('#coub-link-input').val()) === '') {
        $('#coub-link-input').removeClass('uk-form-success')
        $('#coub-link-input').addClass('uk-form-danger')
        UIkit.notification('Link cannot be blank!', {
          status: 'warning',
          pos: 'bottom-center'
        })
        return true
      }
      const link = $('#coub-link-input').val()
      socket.emit('sent link', link)
      $('#coub-link-input').addClass('uk-form-success')
      $('#coub-link-input').val('')
      return false
    }
  })
  $('#message-text-input').keydown(event => {
    if (event.keyCode === 13) {
      if ($.trim($('#message-text-input').val()) === '') {
        return true
      }
      socket.emit(
        'message',
        Cookies.get('username'),
        $('#message-text-input').val()
      )
      $('#message-text-input').val('')
      return false
    }
  })
})
