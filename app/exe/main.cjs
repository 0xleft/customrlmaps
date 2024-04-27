const { app, BrowserWindow, session, ipcMain, protocol } = require('electron')
const axios = require('axios');
const fs = require('fs');

global.AppPath = app.getPath('userData');
global.ExecPath = process.execPath;

// if config.json doesn't exist, create it
if (!fs.existsSync(`${global.AppPath}/projects.json`)) {
	fs.writeFileSync(`${global.AppPath}/projects.json`, "{}");
}
if (!fs.existsSync(`${global.AppPath}/config.json`)) {
	fs.writeFileSync(`${global.AppPath}/config.json`, "{}");
}

require('./routes.cjs');
const { loadProjectsMeta } = require('./loader.cjs');
const { updateFromState } = require('./state.cjs');
const { fetchLatestVersion } = require('./updater.cjs');

loadProjectsMeta();

function createWindow () {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 1500,
		height: 1000,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	})

	win.setMenu(null)

	//win.loadURL('http://localhost:5173');
	//win.webContents.openDevTools()

	win.loadURL('https://app.customrlmaps.com').then(() => {
		updateFromState("version", app.getVersion());
		fetchLatestVersion().then((latestVersion) => {
			console.log(latestVersion);
			if (latestVersion !== app.getVersion()) {
				win.webContents.send('updateAvailable', latestVersion);
			}
		}).catch((err) => {
			console.log(err);
		});
	}).catch((err) => {
		win.loadURL('https://app.customrlmaps.com').then(() => {
			updateFromState("version", app.getVersion());
			fetchLatestVersion().then((latestVersion) => {
				console.log(latestVersion);
				if (latestVersion !== app.getVersion()) {
					win.webContents.send('updateAvailable', latestVersion);
				}
			}).catch((err) => {
				console.log(err);
			});
		}).catch((err) => {
			console.log(err);
		});
	});
}

app.whenReady().then(() => {
	createWindow();
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})