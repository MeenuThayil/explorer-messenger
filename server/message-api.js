const express = require('express');
const messageApi = express();
const path = require('path');
const {logger} = require('./logger');

const http = require('http').Server(messageApi);
const io = require('socket.io')(http);

const rootChannel = '';
const channels = {};
const users = {};
const participants = {
  [rootChannel]: {}
};
// For Demo app.
messageApi.use(express.static(path.join(__dirname, 'public')));

// Just a dummy route.
messageApi.get('/', (req, res) => {
  res.status(200).send('ExplorerMessenger is running');
});

// socket.io connections
io.on('connection', function(socket){

  // handle connection
  const timestamp = getUTCTimestamp();
  socket.join(rootChannel);
  users[socket.id] = '';
  channels[socket.id] = rootChannel;
  addParticipantToChannel(socket, rootChannel);

  logger.info(`[${timestamp}] system-message: ${getUserInfo(socket.id)} connected`);
  io.emit('system-message', { for: 'everyone', user: getUserInfo(socket.id), message: `${getUserInfo(socket.id)} connected`, timestamp});

  // handle disconnection
  socket.on('disconnect', function(){
    const timestamp = getUTCTimestamp();
    removeParticipantFromChannel(socket);
    logger.debug(participants);
    logger.info(`[${timestamp}] system-message: ${getUserInfo(socket.id)} disconnected`);
    io.emit('system-message', { for: 'everyone', user: getUserInfo(socket.id), message: `${getUserInfo(socket.id)} disconnected`, timestamp});
  });

  // handle incoming chat messages
  socket.on('chat-message', function(data){
    const timestamp = getUTCTimestamp();
    logger.info(`[${timestamp}] chat-message: ${getUserInfo(socket.id)} @ ${data.message}`);
    io.to(data.channel).emit('chat-message', {for: 'everyone', user: getUserInfo(socket.id), message: data.message, timestamp});
  });

  // handle channel change
  socket.on('channel-join', function(data){
    const timestamp = getUTCTimestamp();
    removeParticipantFromChannel(socket);
    logger.info(`[${timestamp}] channel-join: ${data}`);
    io.emit('system-message', {for: 'everyone', user: getUserInfo(socket.id), message: `user joined channel ${String(data)}`, timestamp});
    addParticipantToChannel(socket, String(data));
    listParticipants(String(data));
  });

  // handle alias change
  socket.on('alias-change', function(data){
    const timestamp = getUTCTimestamp();
    logger.info(`[timestamp] alias-change: ${data}`);
    io.emit('system-message', {for: 'everyone', user: getUserInfo(socket.id), message: `user changed alias to ${data}`, timestamp});
    users[socket.id] = data;
  });
});

function getUTCTimestamp() {
  return (new Date()).toUTCString();
}

// get current channel by socked ID
// function getChannelInfo(socketID){
//   if(channels[socketID] == ''){
//     return 'root channel';
//   } else {
//     return channels[socketID];
//   }
// }

// get current alias by socked ID
function getUserInfo(socketID){
  if(users[socketID] == ''){
    return 'anonymous user';
  } else {
    return users[socketID];
  }
}

function addParticipantToChannel(socket, channelString){
  if(participants[channelString] == null){
    participants[channelString] = {};
  }
  participants[channelString][socket.id] = true;
  channels[socket.id] = channelString;
  socket.join(channelString);
  logger.info(`adding participant to channel: ${channelString}`);
}

function removeParticipantFromChannel(socket){
  logger.info(`removing participant from channel: ${channels[socket.id]}`);
  delete participants[channels[socket.id]][socket.id];
  socket.leave(channels[socket.id]);
}

function listParticipants(channelString){
  const message = channelString == rootChannel ?
    'list of participants in the lobby' :
    `list of participants @${channelString}`;

  logger.info(`
    --- ${message}
    ${participants[channelString]}
    --- --- --- ---- --- --- ---
    `);
}

module.exports = messageApi;
