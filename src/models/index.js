/**
 * Base Model class for database operations
 */
export default class Model {
	/**
	 * SQL query string
	 * @type {string}
	 */
	#sql;

	/**
	 * Database connection instance
	 * @type {DatabaseManager}
	 */
	#connection;
	/**
	 * Creates a new Model instance
	 * @param {string} tableName - Name of the database table
	 * @param {DatabaseManager} connection - Database manager instance
	 */
	constructor(tableName, connection) {
		this.tableName = tableName;
		this.#connection = connection;
		this._resetQuery();
	}

	/**
	 * Reset query builder
	 */
	_resetQuery() {
		this.#sql = '';
		this.query = {
			type: null,
			select: [],
			columns: [],
			values: [],
			where: {},
			whereIn: [],
			joins: [],
			search: {},
			limit: null,
			offset: null,
			orderBy: null,
			order: null
		};
	}

	/**
	 * Select specific columns
	 * @param {Array<string>} columns - Array of column names
	 * @returns {Model} - Returns this instance for chaining
	 */
	select(columns = ['*']) {
		this.query.type = 'select';
		this.query.select.push(columns.map(column => `${this.tableName}.${column}`).join(', '));
		return this;
	}

	/**
	 * Insert data into table
	 * @param {Array<Object>} data - Array of objects to insert
	 * @returns {Promise} - Returns promise with insert result
	 */
	insert(data) {
		this.query.type = 'insert';
		if (Array.isArray(data)) {
			this.query.columns = Object.keys(data[0]);
			this.query.values = data.map(item => Object.values(item));
		} else if (typeof data === 'object') {
			this.query.columns = Object.keys(data);
			this.query.values = Object.values(data);
		} else throw new Error('Invalid data type for insert');
		return this;
	}

	/**
	 * Update data in table
	 * @param {Object} data - Key-value pairs of data to update
	 * @returns {Model} - Returns this instance for chaining
	 */
	update(data) {
		this.query.type = 'update';
		this.query.columns = Object.keys(data);
		this.query.values = Object.values(data);
		return this;
	}

	/**
	 * Add WHERE clause conditions
	 * @param {Object} conditions - Key-value pairs of conditions
	 * @returns {Model} - Returns this instance for chaining
	 */
	where(conditions) {
		this.query.where = { ...this.query.where, ...conditions };
		return this;
	}

	/**
	 * Add WHERE IN clause
	 * @param {Array} values - Array of values for WHERE IN clause
	 * @returns {Model} - Returns this instance for chaining
	 */
	whereIn(column, values) {
		this.query.whereIn.push({ column, values });
		return this;
	}

	/**
	 * Add JOIN clause
	 * @param {string} type - Type of join (LEFT, RIGHT, INNER)
	 * @param {string} table - Table to join with
	 * @param {Object} conditions - Join conditions
	 * @returns {Model} - Returns this instance for chaining
	 */
	join(type, table, conditions, columns = ['*']) {
		if (arguments.length === 4) {
			this.query.joins.push({ type, table, conditions });
			this.query.select.push(columns.map(column => `${table}.${column}`).join(', '));
		}
		return this;
	}

	/**
	 * Add ROW_NUMBER() OVER (ORDER BY column [ASC|DESC]) AS sr
	 * @returns {Model} - Returns this instance for chaining
	 */
	sr() {
		this.query.select.push('ROW_NUMBER() OVER (ORDER BY ' + (this.query.orderBy || 'created_at') + ' ' + (this.query.order || 'DESC') + ') AS sr');
		return this;
	}

	/**
	 * Add COUNT(*) OVER() AS total
	 * @returns {Model} - Returns this instance for chaining
	 */
	total() {
		this.query.select.push('COUNT(*) OVER() AS total');
		return this;
	}

	/**
	 * Add search conditions for specific columns
	 * @param {Object} conditions - Key-value pairs of column and search keyword
	 * @returns {Model} - Returns this instance for chaining
	 */
	search(conditions) {
		this.query.search = { ...this.query.search, ...conditions };
		return this;
	}

	orderBy(column = 'created_at', order = 'DESC') {
		this.query.orderBy = column;
		this.query.order = order;
		return this;
	}
	/**
	 * Set limit for pagination
	 * @param {number} limit - Number of rows to fetch
	 * @returns {Model} - Returns this instance for chaining
	 */
	limit(limit) {
		this.query.limit = limit;
		return this;
	}

	/**
	 * Set offset for pagination
	 * @param {number} offset - Number of rows to skip
	 * @returns {Model} - Returns this instance for chaining
	 */
	offset(offset) {
		this.query.offset = offset;
		return this;
	}

	/**
	 * Execute the built query
	 * @returns {Promise} - Returns promise with query result
	 */
	async execute() {
		try {
			let result;
			this._prepareSelectQueryString();
			result = await this.#connection.executeQuery(this.#sql, this.query.values);
			this._resetQuery();
			return result;
		} catch (error) {
			console.log(error);
			throw new Error(`Query execution failed: ${error.message}`);
		}
	}

	/**
	 * Prepare SQL query string based on query builder state
	 * @private
	 * @returns {string} - Prepared SQL query string
	 */
	_prepareSelectQueryString() {
		switch (this.query.type) {
			case 'select':
				this.#sql = `SELECT ${this.query.select.join(', ')} FROM ${this.tableName}`;
				// Add joins
				if (this.query?.joins?.length > 0) this.#sql += this.query?.joins?.map(join => ` ${join.type} JOIN ${join.table} ON ${join.conditions}`).join('');
				// Add where conditions
				if (Object.keys(this.query.where).length > 0) {
					this.#sql += ' WHERE ' + Object.keys(this.query.where).map(key => `${this.tableName}.${key} = ?`).join(' AND ');
					this.query.values = this.query.values.concat(Object.values(this.query.where));
				};

				// Add where in conditions
				if (Object.keys(this.query.whereIn).length > 0) {
					this.#sql += Object.keys(this.query.where).length > 0 ? ' AND ' : ' WHERE ';
					this.#sql += this.query.whereIn.map((whereInCondition) => `${whereInCondition.column} IN (${whereInCondition.values.map(() => '?').join(', ')})`);
					this.query.values = this.query.values.concat(this.query.whereIn.flatMap(whereInCondition => whereInCondition.values));
				}

				// Add search conditions (for LIKE queries)
				if (Object.keys(this.query.search).length > 0) {
					this.#sql += Object.keys(this.query.where).length > 0 || Object.keys(this.query.whereIn).length > 0 ? ' AND ' : ' WHERE ';
					this.#sql += Object.keys(this.query.search).map(key => `${this.tableName}.${key} LIKE ?`).join(' AND ');
				}
				// Add order by clause
				if (this.query.orderBy) this.#sql += ` ORDER BY ${this.query.orderBy}`;
				if (this.query.order) this.#sql += ` ${this.query.order}`;
				// Add limit for pagination
				if (this.query.limit !== null) this.#sql += ` LIMIT ${this.query.limit}`;
				// Add offset for pagination
				if (this.query.offset !== null) this.#sql += ` OFFSET ${this.query.offset}`;
				break;
			case 'insert':
				const val = this.query.values.reduce((acc, curr, index) => {
					const chunkIndex = Math.floor(index / this.query.columns.length);
					if (!acc[chunkIndex]) acc[chunkIndex] = [];
					acc[chunkIndex].push(curr);
					return acc;
				}, []).map(chunk => `('${chunk.join("','")}')`).join('');
				this.#sql += `INSERT INTO ${this.tableName} (${this.query.columns.join(', ')}) VALUES ${val}`;
				break;
			case 'update':
				this.#sql += `UPDATE ${this.tableName} SET ${this.query.columns.map(column => `${column} = ?`).join(', ')}`;
				// Add where conditions
				if (Object.keys(this.query.where).length > 0) {
					this.#sql += ' WHERE ' + Object.keys(this.query.where).map(key => `${this.tableName}.${key} = ?`).join(' AND ');
					this.query.values = this.query.values.concat(Object.values(this.query.where));
				};

				// Add where in conditions
				if (Object.keys(this.query.whereIn).length > 0) {
					this.#sql += Object.keys(this.query.where).length > 0 ? ' AND ' : ' WHERE ';
					this.#sql += this.query.whereIn.map((whereInCondition) => `${whereInCondition.column} IN (${whereInCondition.values.map(() => '?').join(', ')})`);
					this.query.values = this.query.values.concat(this.query.whereIn.flatMap(whereInCondition => whereInCondition.values));
				}
				// Add limit
				if (this.query.limit !== null) this.#sql += ` LIMIT ${this.query.limit}`;

				break;
		}
		this.#sql += ';';
	}

}
