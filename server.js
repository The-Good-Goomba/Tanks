const http = require('http');
const fs = require('fs');
const os = require('os');

const hostname = os.networkInterfaces().en0[1].address;
// const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
    console.log('Request for ' + request.url + ' by method ' + request.method);

    if (request.method == 'GET')
    {
        let fileUrl;
        if (request.url == '/') fileUrl = '/index.html';
        else fileUrl = request.url;
        let fileExt = fileUrl.split('.').pop();

        response.statusCode = 200;
        fileUrl = __dirname + fileUrl;

        if (fileExt == 'html') {
            fs.exists(fileUrl, (exists) => {
                if (!exists) {
                    response.statusCode = 404;
                    response.setHeader('Content-Type', 'text/html');
                    response.end("Uh Oh, Stinky! No page found.");
                    console.log("Uh oh");
                } else {
                    response.setHeader('Content-Type', 'text/html');
                    fs.createReadStream(fileUrl).pipe(response);
                }
            });
        }
        else if (fileExt == 'css') {
            response.setHeader('Content-Type', 'text/css');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt == 'js') {
            response.setHeader('Content-Type', 'text/javascript');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt == 'png') {
            response.setHeader('Content-Type', 'image/png');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt == 'obj') {
            response.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt == 'wgsl') {
            response.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt == 'json') {
            response.setHeader('Content-Type', 'application/json');
            fs.createReadStream(fileUrl).pipe(response);
        }
        else {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/html');
            response.end("Uh Oh, Stinky! No page found.")
        }

    }

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
