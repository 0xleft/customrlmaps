const fs = require('fs');
const AppPath = global.AppPath;
const axios = require('axios');

function isBMInstalled() {
    return fs.existsSync(`${AppPath}/bakkesmod.dll`) && fs.existsSync(`${AppPath}/pluginsdk.dll`) && fs.existsSync(`${AppPath}/JoinLocalhost.dll`)
}

async function installBM() {
    const response = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/bakkesmod.dll', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/bakkesmod.dll`, Buffer.from(response.data));
    const response2 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/pluginsdk.dll', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/pluginsdk.dll`, Buffer.from(response2.data));
    const response3 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/JoinLocalhost.dll', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/JoinLocalhost.dll`, Buffer.from(response3.data));
}

module.exports = {
    isBMInstalled,
    installBM,
};