const { ipcMain } = require('electron')
const axios = require('axios');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const unzip = require('extract-zip');
const { addProjectVersion, getProjectVersions, saveProjectsMeta } = require('./loader.cjs');
const { getState } = require('./state.cjs');
const AppPath = global.AppPath;
const find = require('find-process');
const { isBMInstalled, installBM } = require('./bm.cjs');
const injector = require('dll-inject');

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

		if (!isBMInstalled()) {
			await installBM();
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
			return false;
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
			return false;
		}

		// if ORIGINAL_LABS_UNDERPASS.upk doesnt exist copy Labs_Underpass_P.upk to ORIGINAL_LABS_UNDERPASS.upk
		if (!fs.existsSync(path.join(gamePath, 'ORIGINAL_LABS_UNDERPASS.upk'))) {
			fs.copyFileSync(path.join(gamePath, 'Labs_Underpass_P.upk'), path.join(gamePath, 'ORIGINAL_LABS_UNDERPASS.upk'));
		}

		fs.copyFileSync(path.join(projectPath, upkFile), path.join(gamePath, 'Labs_Underpass_P.upk'));

		return true;
	} catch (error) {
		console.error(error);
		return false;
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
		await installBM();

		return true;
	} catch (error) {
		return false;
	}
});

ipcMain.handle('joinServer', async (event, arg) => {
	try {
		if (portf) {
			portf.kill();
			portf = null;
		}

		if (!isBMInstalled()) {
			await installBM();
		}

		const process = await find("name", "RocketLeague.exe");
		if (process.length === 0) {
			return false;
		}
		
		console.log(arg)
		portf = spawn(`${AppPath}/portf.exe`, ['connect', arg]);
		
		portf.stderr.on('data', (data) => {
			let goodData = data.toString().split("\n");
			for (let i = 0; i < goodData.length; i++) {
				if (goodData[i] === '') continue;
				if (goodData[i].includes('Online')) {
					let error = injector.injectPID(process[0].pid, `${AppPath}/bakkesmod.dll`);
					if (error) {
						console.error(error);
					}

					// sleep 5 seconds
					setTimeout(() => {
						error = injector.injectPID(process[0].pid, `${AppPath}/pluginsdk.dll`);
						if (error) {
							console.error(error);
						}

						console.log("injecting JoinLocalhost.dll");
						setTimeout(() => {
							execSync(`${AppPath}/bakkesmod-patch.exe ${AppPath}/JoinLocalhost.dll`);
						}, 500);
					}, 1);
				}
			}
		});

		portf.on('close', (code) => {
			console.log(`child process exited with code ${code}`);
		});

		return true;
	} catch (error) {
	}
});