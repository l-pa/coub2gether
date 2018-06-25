/* global socket */
/* global Cookies */
/* global UIkit */

let jsonResult;

function getJson(coubId) {
  // var link = "http://coub.com/api/oembed.json?url=http%3A//coub.com/view/" + coubId;
  const link = `https://coub.com/api/v2/coubs/${coubId}`;
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: link,
    headers: {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "application/json"
    }
  }).done(data => {
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
  const id = url.substring(url.lastIndexOf("/") + 1);
  return id;
}
function addHistory(title, thumbnailUrl) {
  let count = 1;
  $("#history").append("<tr>");
  $("#history").append(`<th scope="row">${count}</th>`);
  $("#history").append(`<td>${title}</td>`);
  $("#history").append(`<td><img src=${thumbnailUrl}></td>`);
  $("#history").append("</tr>");
  count += 1;
}

$(document).ready(() => {
  if (document.cookie.indexOf("username=") === -1) {
    UIkit.modal("#modal-example", {
      modal: false,
      keyboard: false,
      bgclose: false,
      center: true
    }).show();
    $("#username-button").click(() => {
      if ($.trim($("#username-input").val()) === "") {
        UIkit.notification("Username cannot be blank!", {
          status: "warning",
          pos: "bottom-center"
        });
        $("#username-input").addClass("uk-form-danger");
        return true;
      }

      socket.emit("username", $("#username-input").val());
      Cookies.set("username", $("#username-input").val(), { expires: 7 });
      UIkit.modal("#modal-example").hide();
      return false;
    });
  } else {
    socket.emit("username", Cookies.get("username"));
  }

  $("#enter-button").click(() => {
    if ($.trim($("#coub-link-input").val()) === "") {
      $("#coub-link-input").removeClass("uk-form-success");
      $("#coub-link-input").addClass("uk-form-danger");
      UIkit.notification("Link cannot be blank!", {
        status: "warning",
        pos: "bottom-center"
      });
      return true;
    }

    $("#coub-link-input").removeClass("uk-form-danger");
    $("#coub-link-input").addClass("uk-form-success");

    // const title = getJson(getCoubId($('#coub-link-input').val()));
    // addHistory(title, 'img');

    socket.emit("sent link", $("#coub-link-input").val());
    $("#coub-link-input").val("");
    return false;
  });

  $("#coub-link-input").keydown(event => {
    if (event.keyCode === 13) {
      if ($.trim($("#coub-link-input").val()) === "") {
        $("#coub-link-input").removeClass("uk-form-success");
        $("#coub-link-input").addClass("uk-form-danger");
        UIkit.notification("Link cannot be blank!", {
          status: "warning",
          pos: "bottom-center"
        });
        return true;
      }
      //  const title = getJson(getCoubId($('#coub-link-input').val())); // TODO
      //  addHistory(title, 'img');
      $("#coub-link-input").removeClass("uk-form-danger");
      $("#coub-link-input").addClass("uk-form-success");

      socket.emit("sent link", $("#coub-link-input").val());
      $("#coub-link-input").val("");
      return false;
    }
  });

  $("#message-text-input").keydown(event => {
    if (event.keyCode === 13) {
      if ($.trim($("#message-text-input").val()) === "") {
        return true;
      }
      socket.emit(
        "message",
        Cookies.get("username"),
        $("#message-text-input").val()
      );
      //  $('#chat-div').animate({ scrollTop: $('#chat-div').prop('scrollHeight') }, 500);
      $("#message-text-input").val("");
      return false;
    }
  });
});
