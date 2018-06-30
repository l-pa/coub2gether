/* global socket */

socket.on('user join', () => {});

socket.on('connect', () => {
  socket.emit('get all rooms');
  socket.on('rooms info', (info) => {
    console.log(info);
  });
});
