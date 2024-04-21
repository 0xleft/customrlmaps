const fs = require('fs');
const AppPath = global.AppPath;
const axios = require('axios');

function isBMInstalled() {
    return fs.existsSync(`${AppPath}/portf.exe`) && fs.existsSync(`${AppPath}/bakkesmod.dll`) && fs.existsSync(`${AppPath}/pluginsdk.dll`) && fs.existsSync(`${AppPath}/JoinLocalhost.dll`) && fs.existsSync(`${AppPath}/bakkesmod-patch.exe`);
}

async function installBM() {
    const response = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/bakkesmod.dll', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/bakkesmod.dll`, Buffer.from(response.data));
    const response2 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/pluginsdk.dll', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/pluginsdk.dll`, Buffer.from(response2.data));
    const response3 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/JoinLocalhost.dll', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/JoinLocalhost.dll`, Buffer.from(response3.data));
    const response4 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/portf.exe', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/portf.exe`, Buffer.from(response4.data));
    const response5 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/bakkesmod-patch.exe', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/bakkesmod-patch.exe`, Buffer.from(response5.data));
    return true;
}

module.exports = {
    isBMInstalled,
    installBM,
};