let appConfig;

if (!global.appConfig) {
    global.appConfig = {
        isUserLoginEnabled: true, // done // todo add errors
        isUserRegistrationEnabled: true, // done // todo add errors
        canCreateNewProjects: true, // done
        canUpdateProjects: true,  // done
        canDeleteProjects: true, // done
        canRateProjects: true, // done
        canUpdateProfile: true, // done
        canDeleteProfile: true, // done
        canSearchProjects: true, // done
        canCreateVersions: true, // done
        canDeleteVersions: true, // done
        canSetLatestVersion: true, // done
        adminOnly: false, // done kinda
        canUploadMods: true, // done 
        canUploadMaps: true, // done
    }
}

appConfig = global.appConfig;

function updateConfig(config) {
    appConfig = config;
    global.appConfig = config;
}

export { updateConfig };
export default appConfig;