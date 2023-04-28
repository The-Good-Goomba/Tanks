const http = require('http');
const fs = require('fs');
const os = require('os');
const game = require('./logic');

// const hostname = os.networkInterfaces().en0[1].address;
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((request, response) => {
    console.log('Request for ' + request.url + ' by method ' + request.method);

    if (request.method === 'GET')
    {

        let fileUrl;
        if (request.url === '/') fileUrl = '/index.html';
        else fileUrl = request.url;

        // MARK: Get game data
        if (!fileUrl.includes('.'))
        {
            response.setHeader('Content-Type', 'application/json');

            let command = fileUrl.split('/')[1];
            let argument;
            let data = {};
            switch (command) {
                case 'start':
                    data.id = Math.trunc(Math.random() * 1000);
                    response.end(JSON.stringify(data));
                    break;
                case 'initServer':
                    let serverId = Math.trunc(Math.random() * 1000);
                    Main.gameInstances[serverId] = new game.SceneManager(game.SceneTypes.mainGame);
                    argument = fileUrl.split('/')[2];
                    Main.players[argument] = serverId; // That player is now linked to the new server;
                    data = Main.gameInstances[serverId].currentScene().dataToSend;
                    response.end(data);
                    break;
                case 'joinServer':
                    let sID = argument = fileUrl.split('/')[2];
                    let pID = argument = fileUrl.split('/')[3];
                    response.setHeader('Content-Type', 'text/html');
                    if (Main.gameInstances[sID] === undefined) {
                        response.end('Not the right server');
                    } else {
                        Main.players[pID] = sID;
                        response.end('Successfully connected');
                    }
                    break;
                case 'getGameData':
                    argument = fileUrl.split('/')[2];
                    response.end(Main.gameInstances[argument].currentScene().dataToSend);
                    break;
            }


            return;
        }

        // MARK: Get file data
        let fileExt = fileUrl.split('.').pop();
        response.statusCode = 200;
        fileUrl = __dirname + fileUrl;

        if (fileExt === 'html') {
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
        else if (fileExt === 'css') {
            response.setHeader('Content-Type', 'text/css');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt === 'js') {
            response.setHeader('Content-Type', 'text/javascript');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt === 'png') {
            response.setHeader('Content-Type', 'image/png');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt === 'obj') {
            response.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt === 'wgsl') {
            response.setHeader('Content-Type', 'text/plain');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt === 'json') {
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

class Main
{
    static gameInstances = {};
    static players = {}
}
