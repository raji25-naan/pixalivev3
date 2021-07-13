#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require("../app");
var debug = require("debug")("app:server");
var https = require("http");

const dotenv = require("dotenv");
dotenv.config({ path: "./dev.env" });

/**
 * Get port from environment and store in Express.
 */

const hostname = "localhost";
const port = 7000; //normalizePort(process.env.PORT || '3000');
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = https.createServer(app);

/**
 * Socket.io
 */
var socketApi = require("../chat/socket");
var io = socketApi.io;
io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });


server.listen(port, hostname, () => {
  debug(`Server running at http://${hostname}:${port}/`);
  console.log(`Server running at http://${hostname}:${port}/`);
});
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}