export default class AuthModel {
	#databaseConnection;
	#tableName;
	constructor(databaseConnection) {
		this.#databaseConnection = databaseConnection;
		this.#tableName = "users";
	}
	async login(username, password) {
		const sql = `SELECT id, username, role_id, tenant_id, created_at, updated_at FROM ${this.#tableName} WHERE username='${username}' AND auth_token = '${password}'`;
		return await this.#databaseConnection.executeQuery(sql);
	}
}