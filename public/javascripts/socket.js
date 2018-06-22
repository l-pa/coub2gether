/* global socket */
/* global getCoubId */

const room = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

function addUser(userId) {
  const tableUser = `<div id="${userId}"><tr><th scope="row">${userId}</th></tr></div>`;
  /*   $("#users").append('<div id =' + userId + '>');
       $("#users").append('<tr>');
       $("#users").append('<th scope="row">' + userId + '</th>');
       $("#users").append('<td>' + Date.now() + '</td>');
       $("#users").append('</tr>');
       $("#users").append('</div>'); */

  $('#users').append(tableUser);
}

function message(user, text) {
  let $elementToAppend = $('#chat-box');
  let $data = $(`<p><strong>${text}: </strong>${user}</p>`);
  $elementToAppend.append($data);
}

function removeUser(userId) {
  $(`#${userId}`).remove();
}

function loadIframe(iframeName, url) {
  const link = `https://coub.com/embed/${url}?muted=false&autostart=true&originalSize=false&hideTopBar=true&startWithHD=false&noSiteButtons=true`;
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
    removeUser(user);
  });

  socket.on('username', (user) => {
    $('#username-h3').text(`User list - ${user}`);
  });

  socket.on('message-received', (user, text) => {
    message(user, text);
  });


  socket.on('received link', (link) => {
    console.log(`Coub link: ${link}`);
    loadIframe('coubVideo', getCoubId(link));
    console.log($('#coubVideo').contents());
    $('#coubVideo').contents().find('div.button-prev-next').remove();
  });
});
