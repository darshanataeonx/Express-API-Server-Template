import "mysql2/promise";
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
      this.#logger.info(
        "SYS",
        "New database connection pool created successfully.",
      );
    } catch (error) {
      this.#logger.error(
        "SYS",
        "Can't estalished new connection pool to the database server.",
      );
    }
  }

  /**
   * Acquires a connection from the pool and return its instance.
   * @returns {Connection} Connection object of database server.
   */
  async acquireConnection(requestId) {
    if (!requestId)
      throw new Error("Requesting for connection without request id.");
    this.#logger.info(
      requestId,
      "Acquiring connection to the database server...",
    );
    try {
      const connection = await this.#pool.getConnection();
      this.#logger.info(
        requestId,
        "Connection to the database sever created successfully.",
      );
      return connection;
    } catch (error) {
      this.#logger.error(
        requestId,
        `Can\'t connect to the database server. Error: ${error.message}`,
      );
    }
  }

  /**
   * Executes a query against the database.
   *
   * @param {string} sql - The SQL query to execute.
   * @param {Array} placeholderValues - An array of placeholder values for the query.
   * @returns {Promise<Array>} - The result of the query.
   */
  async _executeQuery(sql, placeholderValues) {
    try {
      return await this.connection.execute(sql, placeholderValues);
    } catch (error) {
      this.#logger.error(
        "SYS",
        `Unable to execute sql query. Query: ${sql} | Error: ${error.message}.`,
      );
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
    if (!this.connection)
      throw new Error("Can not verify the empty database connection.");
    this.#logger.info("SYS", "Verifying the database server connection...");
    try {
      await this.connection.ping();
      this.#logger.info("SYS", "Connection to the database server verified.");
      return true;
    } catch (error) {
      this.#logger.error(
        "SYS",
        `Database server connection verification failed. Error: ${error.message}.`,
      );
    }
  }
}

export default DatabaseManager;
