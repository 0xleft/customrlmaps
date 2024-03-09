"use client";
function getUserRoles(user) {
  if (
      !user ||
      !user.organizationMemberships ||
      user.organizationMemberships.length === 0
  ) {
      return [];
  }

  return user.organizationMemberships.map((m) => ({
      role: m.organization.name.toLowerCase(),
  }));
}

function hasRole(roles, role) {
  return roles.some((r) => r.role === role);
}

export { getUserRoles, hasRole };