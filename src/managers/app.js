import express from "express";
import Logger from "./logger.js";
import ConfigManager from "./config.js";
import DatabaseManager from "./database.js";
import RouteManager from "./route.js";
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
         * @public {Logger} logger
         * @description Holds an instance of the Logger class for logging purposes.
         */
        logger;

        /**
         * @private {DatabaseManager} databaseConnection
         * @description Holds the database connection instance.
         */
        #databaseConnection;

        /**
         * @private {RouteManager} routesManager
         * @description Holds the routes for the entire project/application.
         */
        #routesManager;

        /**
         * Constructor to initialize the App class with default configuration.
         *
         * @constructor
         */
        constructor() {
                console.clear();
                this.#configManager = new ConfigManager();
                this.logger = new Logger(this.#configManager.getConfig("log"));
                this.server = express();
                this.#databaseConnection = new DatabaseManager(
                        this.#configManager.getConfig("database"),
                        this.logger,
                );
                this.#routesManager = new RouteManager(
                        this.server,
                        this.#databaseConnection,
                );
                this.#routesManager.registerCustomRoutes();
        }
        /**
         * Starting the express server.
         */
        startTheServer() {
                this.server.listen(
                        this.#configManager.getConfig("port"),
                        () => {
                                this.logger.info(
                                        "SYS",
                                        "Express API server is started.",
                                );
                                this.logger.debug(
                                        "SYS",
                                        `URL: ${this.#configManager.getConfig("host") || this.#configManager.getConfig("url")} | PORT: ${this.#configManager.getConfig("port")}`,
                                );
                        },
                );
        }
}
export default App;
