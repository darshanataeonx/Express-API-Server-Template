const express = require('express');
const Logger = require('./src/helpers/Logger');
const ConfigManager = require('./src/helpers/configManager');

/**
 * App class file.
 * This class extends the Express class to create an application server with additional functionalities.
 * 
 * Features:
 * - Initializes an Express application.
 * - Provides a method to start the server.
 * 
 * Usage:
 * const app = new App();
 * app.startServer(); // Starts the server on config mention port.
 * 
 * @autor Darshan Ramjiyani
 * @version 1.0.0
 * @since 2024-07-26
 */
class App {
        /**
         * @private {ConfigManager} configManager
         * @description Holds the configuration settings for the application.
         */
        #configManager;

        /**
         * @private {Logger} logger
         * @description Holds an instance of the Logger class for logging purposes.
         */
        #logger;

        /**
         * @private {Object} databaseConnection
         * @description Holds the database connection instance.
         */
        #databaseConnection;

        /**
         * @private {Object} routes
         * @description Holds the routes for the entire project/application.
         */
        #routes;

        /**
         * Constructor to initialize the App class with default configuration.
         * 
         * @constructor
         */
        constructor() {
                this.#configManager = new ConfigManager('config.json');
                this.#logger = new Logger(this.#configManager.getConfig('log'));
                this.server = express();
                this.server.on('start', () => {console.log('app.........');})
        }
        /**
         * Starting the express server.
         */
        startTheServer() {
                this.server.listen(this.#configManager.getConfig('port'), () => {
                        this.#logger.info('SYS', 'Server is started.');
                });
        }
}
module.exports = App;