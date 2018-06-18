var socket = io.connect();
var room = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

function addUser(userId) {
    var tableUser = '<div id="' + userId + '"><tr><th scope="row">' + userId + '</th><td>' + Date.now() + '</td></tr></div>';
    console.log(tableUser)
    /*   $("#users").append('<div id =' + userId + '>');
       $("#users").append('<tr>');
       $("#users").append('<th scope="row">' + userId + '</th>');
       $("#users").append('<td>' + Date.now() + '</td>');
       $("#users").append('</tr>');
       $("#users").append('</div>');*/

    $('#users').append(tableUser);
}

function removeUser(userId) {
    $('#' + userId).remove();
}

function loadIframe(iframeName, url) {
    var link = 'https://coub.com/embed/'+url+'?muted=false&autostart=true&originalSize=false&hideTopBar=true&startWithHD=false';
    var $iframe = $('#' + iframeName);
    if ( $iframe.length ) {
        $iframe.attr('src',link);   
        return false;
    }
    return true;
}

socket.on('user join', function (userId) {
    addUser(userId);
});

socket.on('connect', function (data) {
    console.log("Connected to " + room + " with ID " + socket.id);

    socket.emit('room', room);
    //  socket.emit("user join", socket.id);

    socket.on('users in room', function (user) {
        console.log(user);

        for (let i = 0; i < user.length; i++) {
            addUser(user[i]);
        }
    });

    socket.on('user left', function (user) {
        console.log('User left : ' + user);
        removeUser(user);
    });

    socket.on('received link', function (link) {
        console.log("Coub link: " + link);
        loadIframe("coubVideo", getCoubId(link));
    });




});