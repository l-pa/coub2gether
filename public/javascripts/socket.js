/* global getCoubId */
/* global UIkit */
/* global Audio */
/* global player */

const room = window.location.href.substring(
  window.location.href.lastIndexOf('/') + 1
)
function addUser (userId) {
  const tableUser = `<div id="${userId}"><tr><th scope="row">${userId}</th></tr></div>`
  $('#users').append(tableUser)
}

let count = 1
function addHistory (title, permalink, thumbnailUrl) {
  $('#coubHistory').prepend('<tr>')
  $('#coubHistory').prepend(`<th scope="row">${count}</th>`)
  $('#coubHistory').prepend(`<td>${title}</td>`)
  $('#coubHistory').prepend(`<td><img class="imageHistory" id=${permalink} src=${thumbnailUrl}></td>`)
  $('#coubHistory').prepend('</tr>')
  count += 1
}

function message (user, text) {
  const $elementToAppend = $('#chat-box')
  const $data = $(`<p><strong>${user}: </strong>${text}</p>`)
  $elementToAppend.append($data)
}
function removeUser (userId) {
  $(`#${userId}`).remove()
}
function loadIframe (iframeName, url) {
  const link = `https://coub.com/embed/${url}?muted=false&autostart=true&originalSize=false&hideTopBar=true&startWithHD=false`
  const $iframe = $(`#${iframeName}`)
  if ($iframe.length) {
    $iframe.attr('src', link)
    return false
  }
  return true
}
socket.on('user join', (userId) => {
  addUser(userId)
  $('#users-title').text(`Users (${$('tbody#users').children('div').length})`)
})
socket.on('connect', () => {
  console.log(`Connected to ${room} with ID ${socket.id}`)
  socket.emit('room', room)
  //  socket.emit("user join", socket.id);

  socket.emit('users in room')

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

  socket.on('youtube pause', () => {
    player.pauseVideo()
  })

  socket.on('youtube buffering', (currentTime) => {
    player.seekTo(currentTime, false)
    player.playVideo()
  })

  socket.on('youtube play', () => {
    player.playVideo()
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

  socket.on('received link', (link) => {
    console.log(`Coub link: ${link}`)
    loadIframe('coubVideo', getCoubId(link))
  })
})
