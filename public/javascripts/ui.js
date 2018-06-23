/* global socket */

let jsonResult;

function getJson(coubId) {
  // var link = "http://coub.com/api/oembed.json?url=http%3A//coub.com/view/" + coubId;
  const link = `https://coub.com/api/v2/coubs/${coubId}`;
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    url: link,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'application/json',
    },
  }).done((data) => {
    jsonResult = data;
  });
  window.alert(jsonResult);

  /*   $.getJSON(link, function(data){
    alert(data);
  }); */
  /*
  fetch(link, {mode: 'no-cors'})
  .then(res => res.json())
  .then((out) => {
    console.log('Checkout this JSON! ', out);
  })
  .catch(err => { throw err });
} */
}
function getCoubId(url) {
  const id = url.substring(url.lastIndexOf('/') + 1);
  return id;
}
function addHistory(title, thumbnailUrl) {
  let count = 1;
  $('#history').append('<tr>');
  $('#history').append(`<th scope="row">${count}</th>`);
  $('#history').append(`<td>${title}</td>`);
  $('#history').append(`<td><img src=${thumbnailUrl}></td>`);
  $('#history').append('</tr>');
  count += 1;
}

$(document).ready(() => {
  $('#myModal').modal('show');
  $('#username-button').click(() => {
    if ($.trim($('#username').val()) === '') {
      window.alert('Input can not be left blank');
      return true;
    }
    $('#myModal').modal('hide');
    socket.emit('username', $('#username').val());
    return false;
  });

  $('#enter-button').click(() => {
    if ($.trim($('#coub-link-input').val()) === '') {
      window.alert('Input can not be left blank');
      return true;
    }
    const title = getJson(getCoubId($('#coub-link-input').val()));
    addHistory(title, 'img');

    socket.emit('sent link', $('#coub-link-input').val());
    $('#coub-link-input').val('');
    return false;
  });

  $('#coub-link-input').keydown((event) => {
    if (event.keyCode === 13) {
      if ($.trim($('#coub-link-input').val()) === '') {
        window.alert('Input can not be left blank');
        return true;
      }
      const title = getJson(getCoubId($('#coub-link-input').val()));
      addHistory(title, 'img');

      socket.emit('sent link', $('#coub-link-input').val());
      $('#coub-link-input').val('');
      return false;
    }
  });


  // $('#chat-button').click(() => {
  //   if ($.trim($('#message-text-input').val()) === '') {
  //     window.alert('Input can not be left blank');
  //     return true;
  //   }
  //   socket.emit('message', $('#username').val(), $('#message-text-input').val());
  //   return false;
  // });

  $('#message-text-input').keydown((event) => {
    if (event.keyCode === 13) {
      if ($.trim($('#message-text-input').val()) === '') {
        window.alert('Input can not be left blank');
        return true;
      }
      socket.emit('message', $('#username').val(), $('#message-text-input').val());
      $('#chat-div').animate({ scrollTop: $('#chat-div').prop('scrollHeight') }, 500);
      $('#message-text-input').val('');
      return false;
    }
  });
});
