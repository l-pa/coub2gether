/* global socket */
/* global Cookies */
/* global UIkit */

let jsonResult;

function getJson (coubId) {
  //  const link = `https://coub.com/api/v2/coubs/${coubId}`;
  $.ajax({
    type: 'GET',
    dataType: 'jsonp',
    url: `https://cors.io/?http://coub.com/api/v2/coubs/${coubId}`,
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  }).done((data) => {
    jsonResult = data;
  });
}

function getCoubId (url) {
  const id = url.substring(url.lastIndexOf('/') + 1);
  return id;
}
function addHistory (title, thumbnailUrl) {
  let count = 1;
  $('#history').append('<tr>');
  $('#history').append(`<th scope="row">${count}</th>`);
  $('#history').append(`<td>${title}</td>`);
  $('#history').append(`<td><img src=${thumbnailUrl}></td>`);
  $('#history').append('</tr>');
  count += 1;
}

$(document).ready(() => {
  if (document.cookie.indexOf('username=') === -1) {
    UIkit.modal('#modal-example', {
      modal: false,
      keyboard: false,
      bgclose: false,
      center: true,
    }).show();
    $('#username-button').click(() => {
      if ($.trim($('#username-input').val()) === '') {
        UIkit.notification('Username cannot be blank!', {
          status: 'warning',
          pos: 'bottom-center',
        });
        $('#username-input').addClass('uk-form-danger');
        return true;
      }

      socket.emit('username', $('#username-input').val());
      Cookies.set('username', $('#username-input').val(), { expires: 7 });
      UIkit.modal('#modal-example').hide();
      return false;
    });
  } else {
    socket.emit('username', Cookies.get('username'));
  }

  $('#enter-button').click(() => {
    if ($.trim($('#coub-link-input').val()) === '') {
      $('#coub-link-input').removeClass('uk-form-success');
      $('#coub-link-input').addClass('uk-form-danger');
      UIkit.notification('Link cannot be blank!', {
        status: 'warning',
        pos: 'bottom-center',
      });
      return true;
    }

    $('#coub-link-input').removeClass('uk-form-danger');
    $('#coub-link-input').addClass('uk-form-success');

    // const title = getJson(getCoubId($('#coub-link-input').val()));
    // addHistory(title, 'img');

    socket.emit('sent link', $('#coub-link-input').val());
    $('#coub-link-input').val('');
    return false;
  });

  $('#rng-button').click(() => {
    $('body').addClass('RAINBOW');
  });

  $('#coub-link-input').keydown((event) => {
    if (event.keyCode === 13) {
      if ($.trim($('#coub-link-input').val()) === '') {
        $('#coub-link-input').removeClass('uk-form-success');
        $('#coub-link-input').addClass('uk-form-danger');
        UIkit.notification('Link cannot be blank!', {
          status: 'warning',
          pos: 'bottom-center',
        });
        return true;
      }
      //  const title = getJson(getCoubId($('#coub-link-input').val())); // TODO
      //  addHistory(title, 'img');

      /* fetch(
        " ,
        {
          method: "get"
        }
      )
      .then(function(response) {
        console.log(response.json());
        socket.emit("sent link", link);
        console.log(link);
        $("#coub-link-input").removeClass("uk-form-danger");

        //       $("#coub-link-input").addClass("uk-form-danger");
      })
      .catch(function(err) {
        $("#coub-link-input").addClass("uk-form-success");
        UIkit.notification(err, {
            status: "warning",
            pos: "bottom-center"
          });
        }); */

      const link = $('#coub-link-input').val();
      socket.emit('sent link', link);
      // getJson(getCoubId(link));
      $('#coub-link-input').addClass('uk-form-success');
      $('#coub-link-input').val('');
      return false;
    }
  });

  $('#message-text-input').keydown((event) => {
    if (event.keyCode === 13) {
      if ($.trim($('#message-text-input').val()) === '') {
        return true;
      }
      socket.emit(
        'message',
        Cookies.get('username'),
        $('#message-text-input').val(),
      );
      //  $('#chat-div').animate({ scrollTop: $('#chat-div').prop('scrollHeight') }, 500);
      $('#message-text-input').val('');
      return false;
    }
  });
});
