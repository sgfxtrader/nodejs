const http = require('http');

const server = http.createServer((req, res) => {
  	res.statusCode = 200;
  	res.setHeader("Content-Type", "text/plain");
    res.end("Hello World Francis!");
});

const port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);




