// Add an event handler to the worker
self.addEventListener('message', function (e) {
    var data = e.data;
    switch (data.cmd) {
    case 'log':
        sendToHost("log", data.msg);
        break;
    default:
        error(data.msg);
    }
}, false);

/**
 * Sends a response type and message to the host
 *
 * @param <String> type The type of the message
 * @param <String> message A string or Object in JSON
 */
function sendToHost(type, message) {
    self.postMessage({'type': type, 'msg': message});
}
