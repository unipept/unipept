// This script won't be parsed by JS engines
// because its type is javascript/worker.
self.onmessage = function(e) {
  self.postMessage('msg from worker');
};
// Rest of your worker code goes here.