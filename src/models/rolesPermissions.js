/**
 * RolesPermissions class handles role-based access control (RBAC) by managing policies and their attachments to roles.
 * It provides methods to create, modify and check permissions for different roles.
 */

export default class RolesPermissions {
	/**
	 * Creates a new RolesPermissions instance.
	 */
	constructor() {
		this.policies = new Map();
	}

	/**
	 * Adds a new policy to the RolesPermissions instance.
	 * @param {string} policyName - The name of the policy.
	 * @param {Array<Object>} statements - The statements of the policy.
	 */
	addPolicy(policyName, statements) {
		this.policies.set(policyName, statements);
	}

	/**
	 * Removes a policy from the RolesPermissions instance.
	 * @param {string} policyName - The name of the policy to remove.
	 */
	removePolicy(policyName) {
		this.policies.delete(policyName);
	}

	/**
	 * Attaches a policy to a role.
	 * @param {string} roleName - The name of the role to attach the policy to.
	 * @param {string} policyName - The name of the policy to attach.
	 */
	attachPolicyToRole(roleName, policyName) {
		const policy = this.policies.get(policyName);
		if (!policy) {
			throw new Error(`Policy ${policyName} not found`);
		}

		if (!this.roles) {
			this.roles = new Map();
		}

		if (!this.roles.has(roleName)) {
			this.roles.set(roleName, new Set());
		}

		this.roles.get(roleName).add(policyName);
	}

	/**
	 * Detaches a policy from a role.
	 * @param {string} roleName - The name of the role to detach the policy from.
	 * @param {string} policyName - The name of the policy to detach.
	 */
	detachPolicyFromRole(roleName, policyName) {
		if (this.roles && this.roles.has(roleName)) {
			this.roles.get(roleName).delete(policyName);
		}
	}

	/**
	 * Checks if a role can perform an action on a resource.
	 * @param {string} roleName - The name of the role to check.
	 * @param {string} action - The action to check.
	 * @param {string} resource - The resource to check.
	 * @returns {boolean} - True if the role can perform the action on the resource, false otherwise.
	 */
	canPerformAction(roleName, action, resource) {
		if (!this.roles || !this.roles.has(roleName)) {
			return false;
		}

		const attachedPolicies = this.roles.get(roleName);
		for (const policyName of attachedPolicies) {
			const policy = this.policies.get(policyName);
			if (!policy) continue;

			for (const statement of policy) {
				if (this._matchesStatement(statement, action, resource)) {
					return statement.effect === 'Allow';
				}
			}
		}

		return false;
	}

	/**
	 * Checks if a statement matches an action and resource.
	 * @param {Object} statement - The statement to check.
	 * @param {string} action - The action to check.
	 * @param {string} resource - The resource to check.
	 * @returns {boolean} - True if the statement matches the action and resource, false otherwise.
	 */
	_matchesStatement(statement, action, resource) {
		const matchesAction = this._matchesPattern(statement.action, action);
		const matchesResource = this._matchesPattern(statement.resource, resource);
		return matchesAction && matchesResource;
	}

	/**
	 * Checks if a pattern matches a value.
	 * @param {string|Array<string>} pattern - The pattern to check.
	 * @param {string} value - The value to check.
	 * @returns {boolean} - True if the pattern matches the value, false otherwise.
	 */
	_matchesPattern(pattern, value) {
		if (Array.isArray(pattern)) {
			return pattern.some(p => this._matchesPattern(p, value));
		}

		// Convert AWS-like pattern to regex pattern
		const regexPattern = pattern
			.replace(/\*/g, '.*')
			.replace(/\?/g, '.')
			.replace(/\$/g, '\\$');

		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(value);
	}

	/**
	 * Gets all policies, roles and permissions of tenant from database based on tenantId passed as parameter.
	 * @param {string} tenantId - The ID of the tenant.
	 * @returns {Object} - The policies, roles and permissions of the tenant.
	 */
	getTenantPolicies(tenantId) {
		// get all policies, roles and permissions of tenant from database based on tenantId passed as parameter.
		// return the policies, roles and permissions as an object.
		return {
			policies: [],
			roles: [],
			permissions: [],
		};
	}
}