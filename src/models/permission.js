import DatabaseManager from "../managers/database.js";
export async function get(databaseconnection) {
	const sql = `SELECT
					role_name,
					JSON_OBJECTAGG(module_key, permissions_array) AS module_permissions
					FROM
					(
						SELECT
						users_roles.id AS role_id,
						users_roles.name AS role_name,
						modules.key AS module_key,
						JSON_ARRAY(
							IF(permissions.read = 1, 'read', NULL),
							IF(permissions.create = 1, 'create', NULL),
							IF(permissions.edit = 1, 'edit', NULL),
							IF(permissions.delete = 1, 'delete', NULL)
						) AS permissions_array
						FROM
						permissions
						LEFT JOIN modules ON modules.id = permissions.module_id
						LEFT JOIN users_roles ON users_roles.id = permissions.role_id
					) AS permission_data
				GROUP BY
				role_name,
				role_id;`;
	return await (new DatabaseManager())._executeQuery(sql);
};
