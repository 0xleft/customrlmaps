const { app, BrowserWindow, session, ipcMain, protocol } = require('electron')
const axios = require('axios');
require('./routes.cjs');

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

	win.loadURL('http://localhost:5173');
	win.webContents.openDevTools()

	// win.loadURL('https://app.customrlmaps.com');

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