const { getState, setState, getFromState, updateFromState } = require('./state.cjs');
const fs = require('fs');
const path = require('path');
const AppPath = global.AppPath;

function loadProjectsMeta() {
    const state = getState();
    const projectsMetaPath = path.join(AppPath, 'projects.json');
    if (fs.existsSync(projectsMetaPath)) {
        const projectsMeta = JSON.parse(fs.readFileSync(projectsMetaPath));
        updateFromState('projectsMeta', projectsMeta);
    } else {
        updateFromState('projectsMeta', {});
    }
}

function addProjectVersion(project, version, filename) {
    const projectsMeta = getFromState('projectsMeta');
    let versions = projectsMeta[project.name]?.versions || [];
    // check if version already exists
    if (versions.find(v => v.version === version.version)) return;
    versions.push({
        version: version.version,
        downloadUrl: version.downloadUrl,
        checkedStatus: version.checkedStatus,
        filename,
    });
    projectsMeta[project.name] = {
        ...project,
        downloadedVersions: versions,
    }
    updateFromState('projectsMeta', projectsMeta);
    saveProjectsMeta();
}

function getProjectVersions(projectId) {
    const projectsMeta = getFromState('projectsMeta');
    return projectsMeta[projectId];
}

function saveProjectsMeta() {
    const projectsMetaPath = path.join(AppPath, 'projects.json');
    fs.writeFileSync(projectsMetaPath, JSON.stringify(getFromState('projectsMeta')));
}

module.exports = {
    loadProjectsMeta,
    addProjectVersion,
    saveProjectsMeta,
    getProjectVersions,
};