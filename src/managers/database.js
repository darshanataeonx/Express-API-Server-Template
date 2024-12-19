import mysql from "mysql2/promise";
import Logger from "./logger.js";

/**
 * Database Manager class.
 * This class is responsible for managing the connection pool to the MySQL database,
 * including connection validation and executing queries.
 *
 * @autor Darshan Ramjiyani
 * @version 1.0.0
 * @since 2024-07-26
 */
class DatabaseManager {
	/**
	 * @private
	 * @type {Pool}
	 * @description Holds the MySQL connection pool instance.
	 */
	#pool;

	/**
	 * @private
	 * @type {Logger}
	 * @description Holds the Logger instance for logging activities.
	 */
	#logger;

	/**
	 * @private
	 * @type {Connection}
	 * @description Holds the MySQL connection instance.
	 */
	#connection;

	_currentRequestId;
	/**
	 * Creates an instance of DatabaseManager.
	 *
	 * @constructor
	 * @param {object} config - The configuration object for the MySQL connection pool.
	 * @param {Logger} loggerObject - An instance of a Logger class.
	 */
	constructor(configs, loggerObject) {
		this.#logger = loggerObject;
		this.#logger.info("SYS", "Generating new database connection pool...");
		try {
			this.#pool = mysql.createPool(configs);
			this.#logger.info("SYS", "New database connection pool created successfully.");
		} catch (error) {
			this.#logger.error("SYS", "Can't estalished new connection pool to the database server.");
		}
	}

	/**
	 * Acquires a connection from the pool and return its instance.
	 * @returns {Connection} Connection object of database server.
	 */
	async acquireConnection(requestId) {
		if (!requestId) throw new Error("Requesting for connection without request id.");
		this._currentRequestId = requestId;
		this.#logger.info(this._currentRequestId || "UNKNOWN-REQUEST-ID", "Acquiring connection to the database server...");
		try {
			if (!this.#pool) throw new Error("Pool is not defined.");
			this.#connection = await this.#pool.getConnection();
			this.verifyConnection();
			this.#logger.info(this._currentRequestId || "UNKNOWN-REQUEST-ID", "Connection to the database sever created successfully.");
		} catch (error) {
			this.#logger.error(this._currentRequestId || "UNKNOWN-REQUEST-ID", `Can\'t connect to the database server. Error: ${error.message}`);
		}
	}

	/**
	 * Executes a query against the database.
	 *
	 * @param {string} sql - The SQL query to execute.
	 * @param {Array} placeholderValues - An array of placeholder values for the query.
	 * @returns {Promise<Array>} - The result of the query.
	 */
	async executeQuery(sql, placeholderValues) {
		try {
			if (!this.#connection) await this.acquireConnection(this._currentRequestId || "UNKNOWN-REQUEST-ID");
			return (await this.#connection.execute(sql, placeholderValues))[0];
		} catch (error) {
			this.#logger.error(this._currentRequestId || "UNKNOWN-REQUEST-ID", `Unable to execute sql query. Query: ${sql} with Values: ${JSON.stringify(placeholderValues)} | Error: ${error.message}.`);
			throw error;
		}
	}

	/**
	 * Verifies the connection to the database server.
	 *
	 * This method checks the current database connection and attempts to ping the server
	 * to ensure the connection is active and responsive. It logs the verification process
	 * and any errors encountered.
	 *
	 * @throws {Error} If the connection is not initialized.
	 */
	async verifyConnection() {
		if (!this.#connection)
			throw new Error("Can not verify the empty database connection.");
		this.#logger.info(this._currentRequestId || "UNKNOWN-REQUEST-ID", "Verifying the database server connection...");
		try {
			await this.#connection.ping();
			this.#logger.info(this._currentRequestId || "UNKNOWN-REQUEST-ID", "Connection to the database server verified.");
		} catch (error) {
			this.#logger.error(this._currentRequestId || "UNKNOWN-REQUEST-ID", `Database server connection verification failed. Error: ${error.message}.`);
		}
	}
	/**
	 * Begins a transaction on the database connection.
	 * @returns {Promise<void>}
	 */
	async beginTransaction() {
		if (!this.#connection) throw new Error("Can not begin transaction on empty database connection.");
		return await this.#connection.beginTransaction();
	}

	/**
	 * Commits a transaction on the database connection.
	 * @returns {Promise<void>}
	 */
	async commitTransaction() {
		if (!this.#connection) throw new Error("Can not commit transaction on empty database connection.");
		return await this.#connection.commit();
	}

	/**
	 * Rolls back a transaction on the database connection.
	 * @returns {Promise<void>}
	 */
	async rollbackTransaction() {
		if (!this.#connection) throw new Error("Can not rollback transaction on empty database connection.");
		return await this.#connection.rollback();
	}

	/**
	 * Releases the database connection.
	 * @returns {Promise<void>}
	 */
	async release() {
		if (!this.#connection) throw new Error("Can not release connection on empty database connection.");
		this._currentRequestId = undefined;
		return await this.#connection.release();
	}
}

export default DatabaseManager;
