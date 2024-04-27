const axios = require('axios');
const fs = require('fs');
const { app } = require('electron');
const AppPath = app.getPath('userData');

async function fetchLatestVersion() {
    try {
        return await axios.get("https://api.github.com/repos/pageuplt/CRLMApp/releases/latest").data.tag_name || app.getVersion();
    }
    catch (err) {
        return app.getVersion();
    };
}

function downloadLatestVersion() {
    try {
        axios.get(`https://github.com/pageuplt/CRLMApp/releases/latest/download/CRLM.exe`, { responseType: 'arraybuffer' }).then((res) => {
            fs.writeFileSync(`${AppPath}/CRLM.exe`, Buffer.from(res.data));
        });
    } catch (err) {
        console.error(err);
        return false;
    }

    return true;
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