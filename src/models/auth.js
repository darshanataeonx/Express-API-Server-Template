import DatabaseManager from "../managers/database.js";
export async function login(username, password) {
	const sql = `SELECT * users WHERE username='${username}' AND auth_string = '${password}'`;
	return await (new DatabaseManager())._executeQuery(sql);
};
