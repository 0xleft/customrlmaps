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

async function getUserInfoServer(req, res) {
    return await getServerSession(req, res);
}

async function getUserFromEmail(email) {
    return await prisma.user.findFirst({
        where: {
            email: email,
        },
    });
}

async function getAllUserInfoServer(req, res) {
    const session = await getUserInfoServer(req, res);
    if (!session) {
        return {
            session: null,
            dbUser: null,
        };
    }
    
    const user = await getUserFromEmail(session.user.email);
    
    if (!user) {
        return {
            session: session,
            dbUser: null,
        };
    }

    if ((user.deleted || user.banned) && !user.roles.includes("admin")) {
        return {
            session: session,
            dbUser: null,
        };
    }
    
    return {
        session: session,
        dbUser: user,
    };
}

function isAdmin(user) {
    if (!user) return false;
    if (!user.dbUser) return false;

    return user.dbUser.roles.includes("admin");
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
    getUserInfoServer,
    getAllUserInfoServer,
    getUserFromEmail,
    isAdmin,
}