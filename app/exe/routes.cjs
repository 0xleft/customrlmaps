const { ipcMain } = require('electron')
const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const unzip = require('extract-zip');
const { addProjectVersion, getProjectVersions } = require('./loader.cjs');
const { getState } = require('./state.cjs');
const AppPath = global.AppPath;

var portf = null;

ipcMain.handle('search', async (event, arg) => {
	try {
		const response = await axios.get(arg);
		return response.data;
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('getProjectsMeta', async (event, arg) => {
	try {
		return getState().projectsMeta;
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('download', async (event, arg) => {
	try {
		console.log(arg.version.downloadUrl);
		const realLink = await axios.get(`https://customrlmaps.com${arg.version.downloadUrl}`);
		const response = await axios.get(realLink.data.downloadUrl, { responseType: 'arraybuffer' });
		const downloadPath = `${AppPath}/downloads/${arg.version.version}.zip`;

		if (!fs.existsSync(`${AppPath}/downloads`)) {
			fs.mkdirSync(`${AppPath}/downloads`);
		}

		fs.writeFileSync(downloadPath, Buffer.from(response.data));

		await unzip(downloadPath, { dir: `${AppPath}/projects/${realLink.data.filename}` }, (err) => {
			if (err) {
				event.sender.send('flashError', err);
			}
		});

		fs.unlinkSync(downloadPath);

		addProjectVersion(arg.project, arg.version, realLink.data.filename);

		return true;
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('hostServer', async (event, arg) => {
	try {
		portf = spawn('.\\public\\portf.exe', ['open', 'udp', '7777']);

		portf.stderr.on('data', (data) => {
			let goodData = data.toString().split("\n");
			for (let i = 0; i < goodData.length; i++) {
				if (goodData[i] === '') continue;

				if (!goodData[i].includes('Online') && !goodData[i].includes('keep alive')) {
					event.sender.send('serverId', goodData[i].split(" ")[2]);
				}
			}
		});

		portf.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('stopServer', async (event, arg) => {
	try {
		portf.kill();
		portf = null;
	} catch (error) {
	}
});

ipcMain.handle('joinServer', async (event, arg) => {
	try {
	} catch (error) {
	}
});