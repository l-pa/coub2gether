/* global socket */
/* global getCoubId */
/* global UIkit */

const room = window.location.href.substring(
  window.location.href.lastIndexOf('/') + 1,
);
function getCoubId (url) {
  const id = url.substring(url.lastIndexOf('/') + 1);
  return id;
}
function addUser (userId) {
  const tableUser = `<div id="${userId}"><tr><th scope="row">${userId}</th></tr></div>`;
  $('#users').append(tableUser);
}
function message (user, text) {
  const $elementToAppend = $('#chat-box');
  const $data = $(`<p><strong>${user}: </strong>${text}</p>`);
  $elementToAppend.append($data);
}
function removeUser (userId) {
  $(`#${userId}`).remove();
}
function loadIframe (iframeName, url) {
  const link = `https://coub.com/embed/${url}?muted=false&autostart=true&originalSize=false&hideTopBar=true&startWithHD=false`;
  const $iframe = $(`#${iframeName}`);
  if ($iframe.length) {
    $iframe.attr('src', link);
    return false;
  }
  return true;
}
socket.on('user join', (userId) => {
  addUser(userId);
});
socket.on('connect', () => {
  console.log(`Connected to ${room} with ID ${socket.id}`);
  socket.emit('room', room);
  //  socket.emit("user join", socket.id);

  socket.emit('users in room');

  socket.on('user left', (user) => {
    console.log(`User left : ${user}`);
    UIkit.notification(`User <strong>${user}</strong> left!`, {
      status: 'danger',
      pos: 'top-center',
      timeout: 2000,
    });

    removeUser(user);
  });

  socket.on('username-join-notification', (user) => {
    UIkit.notification(`User <strong>${user}</strong> joined!`, {
      status: 'success',
      pos: 'top-center',
      timeout: 2000,
    });
  });

  socket.on('message-received', (user, text) => {
    message(user, text);
    $('#chat-div').animate(
      { scrollTop: $('#chat-div').prop('scrollHeight') },
      500,
    );
  });

  socket.on('history', (title, permalink, thumbnail) => {
    addHistory(title, permalink, thumbnail);
    UIkit.notification(`${title}`, {
      status: 'success',
      pos: 'bottom-right',
      timeout: 1000,
    });
  });

  socket.on('received link', (link) => {
    console.log(`Coub link: ${link}`);
    loadIframe('coubVideo', getCoubId(link));
  });
});
