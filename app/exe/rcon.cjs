const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

function removeAllowedCommands() {
    const commandsPath = path.join(process.env.APPDATA, '/bakkesmod/bakkesmod/data/rcon_commands.cfg');
    let lines = fs.readFileSync(commandsPath, 'utf-8').split('\n');
    lines = lines.filter(line => line.trim() !== 'unreal_command');
    fs.writeFileSync(commandsPath, lines.join('\n'));
}

function addAllowedCommands() {
    const commandsPath = path.join(process.env.APPDATA, '/bakkesmod/bakkesmod/data/rcon_commands.cfg');
    let data = fs.readFileSync(commandsPath, 'utf-8');
    if (!data.includes('unreal_command')) {
        fs.appendFileSync(commandsPath, '\nunreal_command');
    }
}

function getRCONPassword() {
    const configPath = path.join(process.env.APPDATA, '/bakkesmod/bakkesmod/cfg/config.cfg');
    const lines = fs.readFileSync(configPath, 'utf-8').split('\n');
    for (let line of lines) {
        if (line.includes('rcon_password')) {
            return line.split(' ')[1].trim();
        }
    }
    return null;
}

function connectToLocalhost() {
    const ws = new WebSocket('ws://localhost:9002');
    ws.on('open', function open() {
        ws.send("rcon_password " + getRCONPassword());
        addAllowedCommands();
        ws.send('rcon_refresh_allowed');
        // wait 0.1 second
        setTimeout(() => {
            ws.send('unreal_command "start 127.0.0.1:7777/?Lan?Password=CRLM"')
            setTimeout(() => {
                removeAllowedCommands();
                ws.send('rcon_refresh_allowed');
            }, 100);
        }, 100);
    });
    ws.on('message', function incoming(data) {
        if (data === "noauth") {
            console.log('Wrong password for rcon connection.');
        } else {
            console.log('Connected to localhost.');
        }
    });
    ws.on('close', function close() {
        console.log('disconnected');
    });
    ws.on('error', function error() {
        console.log('error');
    });
}

module.exports = {
    connectToLocalhost,
    removeAllowedCommands,
    addAllowedCommands,
    getRCONPassword,
};