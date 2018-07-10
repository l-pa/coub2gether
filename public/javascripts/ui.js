/* global socket */
/* global Cookies */
/* global UIkit */
$(document).ready(() => {
  if (document.cookie.indexOf('username=') === -1) {
    UIkit.modal('#modal-username', {
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
    socket.emit('sent link', $('#coub-link-input').val());
    $('#coub-link-input').val('');
    return false;
  });
  $('#rng-button').click(() => {
    const link = Math.random().toString(36).substr(2, Math.floor(Math.random() * (6 - 4 + 1) + 4));
    $('#coub-link-input').val(link);
    socket.emit('sent link', link);
    $('#coub-link-input').addClass('uk-form-success');
    $('#coub-link-input').val('');
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
      const link = $('#coub-link-input').val();
      socket.emit('sent link', link);
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
      $('#message-text-input').val('');
      return false;
    }
  });
});
