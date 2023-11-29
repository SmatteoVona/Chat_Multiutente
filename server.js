// chat tra client con le websocket
const http = require('http'); //require http server
const fs = require('fs'); //require filesystem module
const port=3000;    //viene settata la  porta del server
const ip="127.0.0.1"; //viene settato l'ip del server
let numClienti=0; //contatore client connessi
const users=[];  //memorizzo nell'array id socket
//funzione che gestisce la richiesta
function requestHandler(request,response) {
		//lettura da disco dell'index
        fs.readFile ('index.html',function(error,data){
          if (error) {
            response.write(404); //la risorsa richiesta non esiste
          }
          else {
			//invio l'index
            response.writeHead(200,{"content-Type":"text/html"});
            response.write(data,"utf8"); 
          }
          response.end();
        });
 }
//creazione del server
const server=http.createServer(requestHandler);
//server in ascolto su porta e ip 
server.listen(port,ip,function(){
		console.log("Server started on "+ip+":"+port);
});

//let io = require('socket.io').listen(server) socket.io versione 2.3
//let io = require('socket.io')(server)		   socket.io versione successive
const io = require("socket.io")(server, {   // socket.io module and pass the http object(server)
  cors: {									//  socket.io 4.5.3
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.sockets.on ('connection', function (socket) { // WebSocket Connection 
		//(è arrivata una richiesta di connessione dal client)
		socket.username=socket.id; //memorizzo nella variabile di sessione username l'id del socket
		users.push(socket.id);		//nel vettore users memorizzo  gli id dei socket connessi
		console.log ('cliente: connesso '+socket.id);
		//L’istruzione socket.emit permette di inviare al client
		// il messaggio che contiene ip e porta del server
		socket.emit('connesso', ip+" "+"porta:"+" "+port); 
		numClienti++;//aggiorno il numero dei client connessi
		socket.broadcast.emit('stato',numClienti);//aggiorno i client sul numero dei connessi
		socket.emit('stato',numClienti);//aggiorno il client che si è connesso sul numero dei connessi
		console.log('Clienti connessi:',numClienti);
		
		
		//funzione che gestisce i dati che arrivano da un client  
		socket.on('messaggio', function(data) {  
			console.log("client: "+data);
			//invio a tutti i client connessi il messaggio che è arrivato da un client
			socket.broadcast.emit('messaggio', data);
		});
		// funzione che gestisce la disconnessione del client
		socket.on ('disconnect',function() {  
			numClienti--;	//aggiorno il numero dei client connessi
			console.log('Clienti connessi:',numClienti);
			socket.broadcast.emit('stato',numClienti);//informo i client sul numero dei connessi
			console.log('utente: disconnesso '+socket.username);
			for( var i = 0; i < users.length; i++){ //tolgo dal vettore users il socket.id che si disconnette
				if ( users[i] == socket.username) {
					users.splice(i, 1); 
				}
			}
			delete socket;
		});
});
