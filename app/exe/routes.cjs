const { ipcMain, app } = require('electron')
const axios = require('axios');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const unzip = require('extract-zip');
const { addProjectVersion, getProjectVersions, saveProjectsMeta } = require('./loader.cjs');
const { getState, getFromState } = require('./state.cjs');
const AppPath = global.AppPath;
const find = require('find-process');
const { isBMDownloaded, downloadBM, installBM, isBMInstalled } = require('./bm.cjs');
const { connectToLocalhost } = require('./rcon.cjs');
const { downloadLatestVersion, installLatestVersion } = require('./updater.cjs');

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
		if (portf) {
			portf.kill();
			portf = null;
		}

		if (!isBMDownloaded()) {
			await downloadBM();
		}

		portf = spawn(`${AppPath}/portf.exe`, ['open', 'udp', '7777']);

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

ipcMain.handle('setLabsUnderpass', async (event, arg) => {
	try {
		const process = await find("name", "RocketLeague.exe");
		if (process.length === 0) {
			return "Couldn't find Rocket League process";
		}

		const parsedPath = path.parse(process[0].bin);
		const gamePath = path.join(parsedPath.dir, '../..', 'TAGame/CookedPCConsole');

		// find the current version of the project
		const projectPath = path.join(AppPath, 'projects', `${arg.name}-${arg.version}.zip`);
		// find the first upk file in the project
		const projectFiles = fs.readdirSync(projectPath);
		let upkFile = null;
		for (let i = 0; i < projectFiles.length; i++) {
			if (projectFiles[i].includes('.upk')) {
				upkFile = projectFiles[i];
				break;
			}
		}

		if (!upkFile) {
			return "Couldn't find upk file in the projects directory";
		}

		// if ORIGINAL_LABS_UNDERPASS.upk doesnt exist copy Labs_Underpass_P.upk to ORIGINAL_LABS_UNDERPASS.upk
		if (!fs.existsSync(path.join(gamePath, 'ORIGINAL_LABS_UNDERPASS.upk'))) {
			fs.copyFileSync(path.join(gamePath, 'Labs_Underpass_P.upk'), path.join(gamePath, 'ORIGINAL_LABS_UNDERPASS.upk'));
		}

		fs.copyFileSync(path.join(projectPath, upkFile), path.join(gamePath, 'Labs_Underpass_P.upk'));

		return "Success";
	} catch (error) {
		return "Error " + error;
	}
});

ipcMain.handle('deleteProject', async (event, arg) => {
	try {
		const projectsMeta = getState().projectsMeta;
		// remove from projects folder
		for (let i = 0; i < projectsMeta[arg.name].downloadedVersions.length; i++) {
			fs.rmdirSync(path.join(AppPath, 'projects', projectsMeta[arg.name].downloadedVersions[i].filename), { recursive: true });
		}

		// remove from projects.json
		delete projectsMeta[arg.name];
		saveProjectsMeta();

		return true;		
	} catch (error) {
		console.error(error);
		return false;
	}
});

ipcMain.handle('stopServer', async (event, arg) => {
	try {
		portf.kill();
		portf = null;
	} catch (error) {
	}
});

ipcMain.handle('updateBM', async (event, arg) => {
	try {
		await downloadBM();

		return true;
	} catch (error) {
		return false;
	}
});

ipcMain.handle('connectToLocalhost', async (event, arg) => {
	try {
		if (!isBMDownloaded()) {
			event.sender.send('flashError', 'Downloading external assets needed for multiplayer. Please wait...');
			await downloadBM();
			event.sender.send('flashSuccess', 'External assets downloaded successfully.');
		}

		if (!isBMInstalled()) {
			event.sender.send('flashError', 'Installing external assets needed for multiplayer. Please wait...');
			await installBM();
			event.sender.send('flashSuccess', 'External assets installed successfully.');
		} else {
			if (getFromState("weInstalled") !== true) {
				event.sender.send('flashError', 'You have BakkesMod installed, please make sure you have rcon enabled in the settings.');
			}
		}

		connectToLocalhost();
	} catch (error) {
		console.log(error);
	}
});

ipcMain.handle('joinServer', async (event, arg) => {
	try {
		if (portf) {
			portf.kill();
			portf = null;
		}

		if (!isBMDownloaded()) {
			event.sender.send('flashError', 'Downloading external assets needed for multiplayer. Please wait...');
			await downloadBM();
			event.sender.send('flashSuccess', 'External assets downloaded successfully.');
		}

		if (!isBMInstalled()) {
			event.sender.send('flashError', 'Installing external assets needed for multiplayer. Please wait...');
			await installBM();
			event.sender.send('flashSuccess', 'External assets installed successfully.');
		} else {
			if (getFromState("weInstalled") !== true) {
				event.sender.send('flashError', 'You have BakkesMod installed, please make sure you have rcon enabled in the settings.');
			}
		}

		const process = await find("name", "RocketLeague.exe");
		if (process.length === 0) {
			return false;
		}
		
		portf = spawn(`${AppPath}/portf.exe`, ['connect', arg]);
		
		const startTime = Date.now();
		let isOnline = false;

		portf.stderr.on('data', (data) => {
			let goodData = data.toString().split("\n");
			for (let i = 0; i < goodData.length; i++) {
				if (goodData[i] === '') continue;
				console.log(goodData[i]);

				if (goodData[i].includes('Online')) {
					event.sender.send('connected');
					isOnline = true;
				}

				if (Date.now() - startTime > 15000 && !isOnline) {
					event.sender.send('disconnected');
					event.sender.send('flashError', 'Failed to connect to server. Make sure Rocket League is running.');
					portf.kill();
					portf = null;
				};

				if (goodData[i].includes('Error')) {
					event.sender.send('disconnected');
					event.sender.send('flashError', goodData[i]);
				}
			}
		});

		portf.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});
	} catch (error) {
		console.log(error);
	}
});

ipcMain.handle('getProjectFolder', async (event, arg) => {
	try {
		return AppPath;
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('update', async (event, arg) => {
	try {
		if (!await downloadLatestVersion()) {
			event.sender.send('flashError', 'Failed to download the latest version.');
			return;
		}
		installLatestVersion();
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('getVersion', async (event, arg) => {
	try {
		return app.getVersion();
	} catch (error) {
		console.error(error);
	}
});