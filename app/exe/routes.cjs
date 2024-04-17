const { ipcMain } = require('electron')
const axios = require('axios');
const { spawn } = require('child_process');

var portf = null;

ipcMain.handle('search', async (event, arg) => {
	try {
		const response = await axios.get(arg);
		return response.data;
	} catch (error) {
		console.error(error);
	}
});

ipcMain.handle('download', async (event, arg) => {
	try {
	} catch (error) {
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