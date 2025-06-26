const { PeerServer } = require('peer');

const port = process.env.PORT || 9000;

const server = PeerServer({
  port: port,
  path: '/',
  allow_discovery: true
});

console.log(`PeerServer started on port ${port} with discovery enabled`); 