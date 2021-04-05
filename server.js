const http = require('http');

const port = process.env.PORT || 5000;
const server = http.createServer();
// const logic = require('././logic');
// const models = require('././models');

server.listen(port, () => {
    console.log("Server is listen at port number " + port);
});
