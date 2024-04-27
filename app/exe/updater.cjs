const axios = require('axios');
const fs = require('fs');
const { app } = require('electron');
const AppPath = app.getPath('userData');

function fetchLatestVersion() {
    axios.get("https://api.github.com/repos/pageuplt/CRLMApp/releases/latest").then((res) => {
        return res.data.tag_name;
    }).catch((err) => {
        console.error(err);
        return app.getVersion();
    });
}

function downloadLatestVersion() {
    axios.get(`https://github.com/pageuplt/CRLMApp/releases/latest/download/CRLM.exe`, { responseType: 'arraybuffer' }).then((res) => {
        fs.writeFileSync(`${AppPath}/CRLM.exe`, Buffer.from(res.data));
    });
}

function installLatestVersion() {
    const child = require('child_process').execFile(`${AppPath}/CRLM.exe`, [], { detached: true });
    child.unref();
    require('electron').app.quit();

    return true;
}

module.exports = {
    fetchLatestVersion,
    downloadLatestVersion,
    installLatestVersion,
};