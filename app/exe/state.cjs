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
    return state[property];
};

const updateFromState = (property, value) => {
	state[property] = value;
    saveState();
};

const saveState = () => {
    fs.writeFileSync(`${AppPath}/config.json`, JSON.stringify(state));
};

module.exports = {
    getState,
    getFromState,
	updateFromState,
    setState,
    saveState,
};