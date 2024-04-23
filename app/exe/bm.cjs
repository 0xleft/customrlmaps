const fs = require('fs');
const AppPath = global.AppPath;
const axios = require('axios');
const unzip = require('extract-zip');
const { updateFromState, getState } = require('./state.cjs');

function isBMDownloaded() {
    return fs.existsSync(`${AppPath}/portf.exe`) && fs.existsSync(`${AppPath}/bakkesmod.zip`);
}

function isBMInstalled() {
    return fs.existsSync(`${AppPath}/../bakkesmod`);
}

async function downloadBM() {
    const response2 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/bakkesmod.zip', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/bakkesmod.zip`, Buffer.from(response2.data));
    const response4 = await axios.get('https://github.com/pageuplt/bmdll/releases/latest/download/portf.exe', { responseType: 'arraybuffer' });
    fs.writeFileSync(`${AppPath}/portf.exe`, Buffer.from(response4.data));
    return true;
}

async function installBM() {
    unzip(`${AppPath}/bakkesmod.zip`, { dir: `${AppPath}/../bakkesmod/bakkesmod` }, (err) => {
        if (err) {
            console.error(err);
        }
    });
    updateFromState("weInstalled", true);
}

async function removeBM() {
    fs.rmSync(`${AppPath}/../bakkesmod`, { recursive: true });
}

module.exports = {
    isBMInstalled,
    downloadBM,
    installBM,
    removeBM,
    isBMDownloaded,
};