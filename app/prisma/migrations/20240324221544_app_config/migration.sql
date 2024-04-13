-- CreateTable
CREATE TABLE "appConfig" (
    "id" SERIAL NOT NULL,
    "isUserLoginEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isUserRegistrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "canCreateNewProjects" BOOLEAN NOT NULL DEFAULT true,
    "canUpdateProjects" BOOLEAN NOT NULL DEFAULT true,
    "canDeleteProjects" BOOLEAN NOT NULL DEFAULT true,
    "canRateProjects" BOOLEAN NOT NULL DEFAULT true,
    "canUpdateProfile" BOOLEAN NOT NULL DEFAULT true,
    "canDeleteProfile" BOOLEAN NOT NULL DEFAULT true,
    "canSearchProjects" BOOLEAN NOT NULL DEFAULT true,
    "canCreateVersions" BOOLEAN NOT NULL DEFAULT true,
    "canDeleteVersions" BOOLEAN NOT NULL DEFAULT true,
    "canSetLatestVersion" BOOLEAN NOT NULL DEFAULT true,
    "adminOnly" BOOLEAN NOT NULL DEFAULT false,
    "canUploadMods" BOOLEAN NOT NULL DEFAULT true,
    "canUploadMaps" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "appConfig_pkey" PRIMARY KEY ("id")
);
