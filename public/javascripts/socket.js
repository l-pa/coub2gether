/* global getCoubId */
/* global UIkit */
/* global Audio */
/* global player */

var roomInfo

window.onload = function () { socket.emit('room', room) }

socket.on('room info', (info) => {
  roomInfo = info
  console.log('Provider : ' + info.provider + ' last link ' + info.lastLink)
  if (info.provider == 'youtube') {
    socket.emit('youtube provider')
    if (info.lastLink != null) {
      player.loadVideoById(getYoutubeId(info.lastLink))
    }
  } else {
    socket.emit('coub provider')
    if (info.lastLink != null) {
      loadIframe('coubVideo', getCoubId(info.lastLink))
    }
  }
})

const room = window.location.href.substring(
  window.location.href.lastIndexOf('/') + 1
)

function message(user, text) {
  const $elementToAppend = $('#chat-box')
  const $data = $(`<p><strong>${user}: </strong>${text}</p>`)
  $elementToAppend.append($data)
}

function removeUser(userId) {
  $(`#${userId}`).remove()
}

socket.on('user join', (userId) => {
  console.log('User joined : ' + userId)
  addUser(userId)
  $('#users-title').text(`Users (${$('tbody#users').children('div').length})`)
})

socket.on('connect', () => {
  console.log(`Connected to ${room} with ID ${socket.id}`)

  // socket.emit('room', room)

  //socket.emit("user join", socket.id);

  socket.on('user left', (user) => {
    console.log(`User left : ${user}`)
    UIkit.notification(`User <strong>${user}</strong> left!`, {
      status: 'danger',
      pos: 'top-center',
      timeout: 2000
    })

    removeUser(user)
    $('#users-title').text(`Users (${$('tbody#users').children('div').length})`)
  })

  socket.on('username-join-notification', (user) => {
    UIkit.notification(`User <strong>${user}</strong> joined!`, {
      status: 'success',
      pos: 'top-center',
      timeout: 2000
    })
  })

  socket.on('message-received', (user, text) => {
    message(user, text)
    $('#chat-div').animate(
      { scrollTop: $('#chat-div').prop('scrollHeight') },
      500
    )
    const audio = new Audio('/sound/message-sound.ogg')
    audio.volume = 0.3
    audio.play()
  })

  socket.on('history', (title, permalink, thumbnail) => {
    addHistory(title, permalink, thumbnail)
    UIkit.notification(`${title}`, {
      pos: 'bottom-center',
      timeout: 500
    })
  })
})
