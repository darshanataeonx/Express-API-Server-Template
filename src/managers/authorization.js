import { get } from "../models/permission.js";
class Authorization {
	#rolePermissions;

	constructor() { }

	async #fetchPermissionsByRoles() {
		this.#rolePermissions = await get(undefined);
	}

	/**
	 * Authorize user based on their role, module, and required permission.
	 * @param {string} userRole - Role of the user making the request
	 * @param {string} moduleName - Module being accessed
	 * @param {string} requiredPermission - Permission required for the route
	 * @returns {boolean} True if authorized, false otherwise
	 */
	authorize(userRole, moduleName, requiredPermission) {
		const permissions =
			this.#rolePermissions[userRole]?.[moduleName];
		if (!permissions) return false; // User role or module not
		return permissions.includes(requiredPermission);
	}
}

export default Authorization;
