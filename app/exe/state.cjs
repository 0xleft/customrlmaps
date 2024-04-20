const { ipcMain, dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');
const unzip = require('extract-zip');
const AppPath = global.AppPath;

const config = require(`${AppPath}/config.json`);

const state = { ...config };

const getState = () => state;
const setState = (newState) => Object.assign(state, newState);

const getFromState = (property) => {
    if (state[property]) return state[property];
    return undefined;
};

const updateFromState = (property, value) => {
	state[property] = value;
};

ipcMain.on('flashError', (_, err) => dialog.showMessageBox({ title: 'Error', message: 'An error occurred', detail: `${err}` }));

module.exports = {
    getState,
    getFromState,
	updateFromState,
    setState,
};