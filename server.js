const express = require('express');
const app = express();

const server = require('http').createServer(app);

const io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 3000);
console.log('Server running on port 3000.');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('User connected: %s online', connections.length);

    socket.on('disconnect', function(data){
        if(socket.username){
            users.splice(users.indexOf(socket.username), 1);
            updateUsers();
        }
        connections.splice(connections.indexOf(socket), 1);
        console.log('User disconneted: %s online', connections.length);
    });

    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    socket.on('new user', function(data, callback){
        if(users.indexOf(data) != -1){
            callback(false);
        } else {
            callback(true);
            socket.username = data;
            users.push(socket.username);
            updateUsers();
        }
    });

    function updateUsers(){
        io.sockets.emit('get users', users);
    }
});