var count = 1;
var jsonResult;

function addHistory(title, thumbnailUrl) {
    $("#history").append('<tr>');
    $("#history").append('<th scope="row">' + count++ + '</th>');
    $("#history").append('<td>' + title + '</td>');
    $("#history").append('<td><img src=' + thumbnailUrl + '></td>');
    $("#history").append('</tr>');
}

$(document).ready(function () {
    $('#myModal').modal('show');

    $('#username-button').click(function(){
        if ($.trim($('#username').val()) == '') {
            alert('Input can not be left blank');
            return true;
        }
        $('#myModal').modal('hide');
        socket.emit('username', $('#username').val());
    });

    $("#enter-button").click(function () {
        if ($.trim($('#coub-link-input').val()) == '') {
            alert('Input can not be left blank');
            return true;
        }
        var title = getJson(getCoubId($('#coub-link-input').val()));
        addHistory(title, "img");

        socket.emit('sent link', $('#coub-link-input').val());
        $('#coub-link-input').val('');
    });

    $("#coub-link-input").keydown(function (event) {
        if (event.keyCode == 13) {
            if ($.trim($('#coub-link-input').val()) == '') {
                alert('Input can not be left blank');
                return true;
            }
            var title = getJson(getCoubId($('#coub-link-input').val()));
            addHistory(title, "img");

            socket.emit('sent link', $('#coub-link-input').val());
            $('#coub-link-input').val('');


        }
    });

    // var myCoub = document.getElementById('coubVideo').contentWindow;
    // var messageHandler = function(e) {
    //     if (e.data == 'playStarted'){
    //     console.log('Video starts playing');
    //     }
    //   }
    //   myCoub.addEventListener('message', messageHandler);

});

function getJson(coubId) {
    //var link = "http://coub.com/api/oembed.json?url=http%3A//coub.com/view/" + coubId;
    var link = "https://coub.com/api/v2/coubs/" + coubId;
   $.ajax({
        type: "GET",
        dataType: "jsonp",
        url: link,
        headers: {
            'Access-Control-Allow-Credentials' : true,
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'GET',
            'Access-Control-Allow-Headers':'application/json',
          },
    }).done(function (data) {
        jsonResult = data;
    });
    alert(jsonResult);

  /*   $.getJSON(link, function(data){
         alert(data);
     });*/
/*
     fetch(link, {mode: 'no-cors'})
         .then(res => res.json())
         .then((out) => {
             console.log('Checkout this JSON! ', out);
         })
         .catch(err => { throw err });
}*/
}

function getCoubId(url) {
    var id = url.substring(url.lastIndexOf('/') + 1);
    return id;
}