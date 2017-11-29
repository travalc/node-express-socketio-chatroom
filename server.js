const express = require('express');
const path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, './static')));

app.get('/', function(req, res) 
{
    res.render('index.html');
});

const server = app.listen(8000, function() 
{
    console.log('listening on port 8000');
});

const io = require('socket.io').listen(server);
let users = [];
let messages = [];
io.sockets.on('connection', function(socket)
{
    console.log('Client/socket is connected!');
    console.log('Client/socket id is:', socket.id);
    socket.emit('initialize', {id: socket.id, messages: messages});

    socket.on('got_a_new_user', function(data)
    {
        users.push({name: data.name, id: data.id});
        socket.broadcast.emit('new_user', {name: data.name, id:data.id});
    });

    socket.on('new_message', function(data)
    {
        const user = users.filter(function(entry)
        {
            return entry.id == socket.id;
        });
        messages.push({name: user[0].name, message: data.message});
        io.emit('add_message', {name: user[0].name, message: data.message});
    });
});