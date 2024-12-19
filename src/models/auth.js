import Model from "./index.js";

export default class AuthModel {
	#model;
	constructor(databaseConnection) {
		this.#model = new Model("users", databaseConnection);
	}
	async login(username, password) {
		return await this.#model.select().where({ username, auth_token: password }).limit(1).execute();
	}

	async getAll(searchTerm, limit, offset) {
		return await this.#model.select().sr().search(searchTerm).limit(limit).offset(offset).execute();
	}
}