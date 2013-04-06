// This script won't be parsed by JS engines
// because its type is javascript/worker.

// Add an event handler to the worker
self.addEventListener('message', function (e) {
  var data = e.data;
  switch (data.cmd) {
    case 'log':
      sendToHost("print", data.msg);
      break;
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg +
                       '. (buttons will no longer work)');
      self.close(); // Terminates the worker.
      break;
    default:
      sendToHost("error", data.msg);
  };
}, false);


// Sends a response type and message to the host
function sendToHost(type, message) {
    self.postMessage({'type': type, 'msg': message});
}
