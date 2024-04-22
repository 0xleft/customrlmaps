const fs = require('fs');
const AppPath = global.AppPath;
const axios = require('axios');

function isBMInstalled() {
    return fs.existsSync(`${AppPath}/portf.exe`) && fs.existsSync(`${AppPath}/bakkesmod.zip`);
}

async function installBM() {
    const response2 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/bakkesmod.zip', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/bakkesmod.zip`, Buffer.from(response2.data));
    const response4 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/portf.exe', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/portf.exe`, Buffer.from(response4.data));
    return true;
}

module.exports = {
    isBMInstalled,
    installBM,
};