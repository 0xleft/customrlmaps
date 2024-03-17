import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';

async function getUserFromUsername(username) {
    return await prisma.user.findFirst({
        where: {
            username: username,
        },
    });
}

async function userExists(username) {
    const user = await getUserFromUsername(username);
    return user !== null;
}

async function getUserFromId(id) {
    return await prisma.user.findFirst({
        where: {
            id: id,
        },
    });
}

async function getUserRolesFromId(id) {
    const user = await getUserFromId(id);
    return user.roles; 
}

async function getUserRolesFromUsername(username) {
    const user = await getUserFromUsername(username);
    return user.roles;
}

function hasRole(user, role) {
    return user.roles.includes(role);
}

function userOwnsProject(user, project) {
    return user.id === project.userId;
}

function userOwnsVersion(user, version) {
    return userOwnsProject(user, version.project);
}

function userCanEditProject(user, project) {
    return hasRole(user, "ADMIN") || userOwnsProject(user, project);
}

function userCanEditVersion(user, version) {
    return hasRole(user, "ADMIN") || userOwnsVersion(user, version);
}

async function getUserInfo(req, res) {
    return await getServerSession(req, res);
}

async function getAllUserInfoServer(req, res) {
    const session = await getUserInfo(req, res);
    if (!session) {
        return null;
    }
    const user = await getUserFromUsername(session.user.name);
    return {
        session,
        dbUser: user,
    };
}

export {
    getUserFromUsername,
    userExists,
    getUserFromId,
    getUserRolesFromId,
    getUserRolesFromUsername,
    hasRole,
    userOwnsProject,
    userOwnsVersion,
    userCanEditProject,
    userCanEditVersion,
    getUserInfo,
    getAllUserInfoServer,
}