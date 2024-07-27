const mysql = require('mysql2/promise');
import '../helpers/logger';
class DatabaseManager{
    #connection;
    #logger;
    /**
     * Connect to the mysql database.
     * 
     * @param {object} databaseConfig Config of the mysql connection string.
     * @param {Logger} loggerObject Logger class object.
     */
    constructor(databaseConfig, loggerObject){
        this.#connection = mysql.createConnection(databaseConfig);
        this.#logger = loggerObject;
        this.#validateConnection();
    }

    #validateConnection(){
        try{
            this.#connection.ping();
            this.#logger.info('SYS', 'Connection to databse has been successfully validated.');
        } catch (error){
            this.#logger.error('SYS',`Error while validating the database connection. Error: ${error.message}`);
        }
    }

    startDatabaseTransaction(){
        this.#connection.beginTransaction();
    }

    async _executeQuery(sql, placeholderValue){
        return await this.#connection.execute(sql, placeholderValue);
    }
}

module.exports = DatabaseManager;