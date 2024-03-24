import prisma from "./prisma";

async function getConfig() {
    let appConfig = await prisma.appConfig.findFirst();

    if (!appConfig) {
        appConfig = await prisma.appConfig.create({
            data: {
                isUserLoginEnabled: true,
                isUserRegistrationEnabled: true,
                canCreateNewProjects: true,
                canUpdateProjects: true,
                canDeleteProjects: true,
                canRateProjects: true,
                canUpdateProfile: true,
                canDeleteProfile: true,
                canSearchProjects: true,
                canCreateVersions: true,
                canDeleteVersions: true,
                canSetLatestVersion: true,
                adminOnly: false, // not implemented
                canUploadMods: true,
                canUploadMaps: true,
            }
        });
    }

    return appConfig;
}

async function updateConfig(config) {
    await prisma.appConfig.update({
        where: {
            id: (await getConfig()).id
        },
        data: config,
    });
}

export { updateConfig, getConfig };