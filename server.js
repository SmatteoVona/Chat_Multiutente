const http = require('http');
const fs = require('fs');
const port = 3000;
const ip = "127.0.0.1";
let numClienti = 0;
const users = [];

function requestHandler(request, response) {
  fs.readFile('index.html', function (error, data) {
    if (error) {
      response.write(404);
    } else {
      response.writeHead(200, { "content-Type": "text/html" });
      response.write(data, "utf8");
    }
    response.end();
  });
}

const server = http.createServer(requestHandler);
server.listen(port, ip, function () {
  console.log("Server started on " + ip + ":" + port);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.sockets.on('connection', function (socket) {
  socket.username = socket.id;
  users.push(socket.username);
  updateConnectedUsers();

  socket.emit('connesso', ip + " " + "porta:" + " " + port);
  numClienti++;
  io.sockets.emit('stato', numClienti);
  console.log('Clienti connessi:', numClienti);

  socket.on('messaggio', function (data) {
    console.log("client: " + data);
    socket.broadcast.emit('messaggio', data);
  });

  socket.on('disconnect', function () {
    numClienti--;
    console.log('Clienti connessi:', numClienti);
    io.sockets.emit('stato', numClienti);
    console.log('utente: disconnesso ' + socket.username);

    const index = users.indexOf(socket.username);
    if (index > -1) {
      users.splice(index, 1);
    }
    updateConnectedUsers();
  });
});

function updateConnectedUsers() {
  io.sockets.emit('update-users', users);
}
