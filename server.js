const http = require('http');
const fs = require('fs');
const os = require('os');
const game = require('./logic');

// const hostname = os.networkInterfaces().en0[1].address;
// const hostname = '127.0.0.1';
const hostname = '0.0.0.0';
const port = 8031;

var Main = function () {
    "use strict";
    if (Main._instance) {
        // Allows the constructor to be called multiple times
        return Main._instance
    }
    Main._instance = this;

    this.gameInstances = {};
    this.players = {}
    this.frameRate = 60;
    this.deltaTime = () => {
        return 1/this.frameRate;
    }
    this.RunGame = () =>
    {
        for (let bruh in this.gameInstances)
        {
            this.gameInstances[bruh].doUpdate();
        }
        setTimeout( () =>{
            this.RunGame();
        }, 1000 / this.frameRate)
    }

}
new Main();

const server = http.createServer(async (request, response) => {
    // console.log('Request for ' + request.url + ' by method ' + request.method);

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

                    argument = fileUrl.split('/')[2];
                    let colour = Number(fileUrl.split('/')[3]);
                    if (isNaN(colour)) { colour = 0; }

                    Main().players[argument] = {serverId: serverId}; // That player is now linked to the new server;
                    Main().players[argument].input = {
                        a: false,
                        s: false,
                        w: false,
                        d: false,
                        mousePos: [0.5,0.5],
                        leftMouse: false,
                        rightMouse: false,
                    }
                    Main().gameInstances[serverId] = new game.SceneManager(game.SceneTypes.mainGame, serverId);
                    await Main().gameInstances[serverId].currentScene().build();
                    console.log("Started server");
                    Main().gameInstances[serverId].addPlayer(argument,colour);
                    data = Main().gameInstances[serverId].currentScene().dataToSend;
                    data.serverID = serverId;
                    response.end(JSON.stringify(data));
                    break;
                case 'joinServer':
                    let sID = fileUrl.split('/')[2];
                    let pID = fileUrl.split('/')[3];
                    let amongs = Number(fileUrl.split('/')[4]);

                    response.setHeader('Content-Type', 'text/html');
                    if (Main().gameInstances[sID] === undefined) {
                        response.end('Not the right server');
                    } else {
                        Main().players[pID] = {serverId: sID};
                        Main().players[pID].input = {
                            a: false,
                            s: false,
                            w: false,
                            d: false,
                            mousePos: [0.5,0.5],
                            leftMouse: false,
                            rightMouse: false,
                        }
                        if(!Main().gameInstances[sID].addPlayer(pID, amongs)) { response.end('Colour is already taken!'); }
                        else { response.end('Successfully connected'); }
                    }
                    break;
                case 'getGameData':
                    argument = fileUrl.split('/')[2];
                    let sus = JSON.stringify(Main().gameInstances[Main().players[argument].serverId].currentScene().dataToSend);
                    response.end(sus);
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
                if (!exists) { sendError(response) }
                else {
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
        } else if (fileExt === 'mp3') {
            response.setHeader('Content-Type', 'audio/mpeg');
            fs.createReadStream(fileUrl).pipe(response);
        } else if (fileExt === 'wav') {
            response.setHeader('Content-Type', 'audio/wav');
            fs.createReadStream(fileUrl).pipe(response);
        }
        else { sendError(response); }

    }

    else if (request.method === 'POST')
    {
        let body = ''
        request.on('data', function(data) {
            body += data
        })
        request.on('end', function() {
            let obj = JSON.parse(body);
            if (obj.command === "postPlayerData")
            {
                delete obj.command;
                let id = obj.playerID;
                delete obj.playerID;
                if (id === undefined) { sendError(response); console.log(`ID is undefined`); return;}
                Main().players[id].input = obj;
                response.writeHead(200, {'Content-Type': 'text/html'})
                response.end('post received')
            } else {
                Main().gameInstances[Main().players[obj.playerID].serverId].passCommand(obj.command)
                response.writeHead(200, {'Content-Type': 'text/html'})
                response.end('post received')
            }


        })
    }

});

let sendError = (response) => {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'text/html');
    response.end("Uh Oh, Stinky! No page found.")
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    Main().RunGame();
});

module.exports.Main = Main;