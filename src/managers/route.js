import express from "express";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
/**
 * RouteManager class.
 * This class is responsible for managing and registering all routes for the Express server instance,
 * including middleware for request preparation, error handling, and custom routes.
 *
 * @class
 * @autor Darshan Ramjiyani
 * @version 1.0.0
 * @since 2024-07-26
 */
class RouteManager {
        #expressServerInstance;
        #databaseManagerInstance;

        /**
         * Creates an instance of RouteManager.
         *
         * @constructor
         * @param {object} expressServerInstance - The Express server instance.
         * @param {object} databaseManagerInstance - The instance of the DatabaseManager class.
         */
        constructor(expressServerInstance, databaseManagerInstance) {
                this.#expressServerInstance = expressServerInstance;
                this.#databaseManagerInstance = databaseManagerInstance;
                this.#setEssentialRoutes();
        }

        /**
         * Sets essential routes and middleware for the Express server.
         * @private
         */
        async #setEssentialRoutes() {
                this.#expressServerInstance.use(express.json());
                this.#expressServerInstance.use(
                        async (request, response, next) => {
                                const Logger =
                                        await dyanamicImport("./logger.js");
                                const { v4 } = await dyanamicImport("uuid");
                                request["x-request-id"] = v4();
                                response.setHeader(
                                        "x-request-id",
                                        request["x-request-id"],
                                );
                                Logger.logRequest(request);
                                try {
                                        request["__databaseConnection"] =
                                                await this.#databaseManagerInstance.acquireConnection(
                                                        request["x-request-id"],
                                                );
                                        await request[
                                                "__databaseConnection"
                                        ].beginTransaction();
                                } catch (error) {
                                        return next(error);
                                }
                                response.on("finish", async () => {
                                        Logger.res(
                                                request["x-request-id"],
                                                `Response status = ${response.statusCode}`,
                                        );
                                        if (request["__databaseConnection"]) {
                                                await request[
                                                        "__databaseConnection"
                                                ].release();
                                        }
                                });
                                next();
                        },
                );
                this.registerCustomRoutes();
        }

        /**
         * Registers custom routes from the routes directory.
         *
         * @param {object} expressServerInstance - The Express server instance.
         */
        async registerCustomRoutes() {
                const routers = this.readRoutes(
                        dirname(fileURLToPath(import.meta.url)) + "/../routes",
                );
                Object.keys(routers).forEach((basePath) => {
                        this.#expressServerInstance.use(
                                basePath,
                                routers[basePath],
                        );
                });
                this.#setErrorHandlingRoute();
        }

        /**
         * Sets the error handling route.
         * @private
         */
        async #setErrorHandlingRoute() {
                this.#expressServerInstance.use(async (err, req, res, next) => {
                        console.error(err.stack);
                        await req["__databaseConnection"].rollback();
                        res.status(500).json({
                                error: true,
                                message:
                                        getConfigValue("") === "live" ||
                                        getConfigValue("") === "production"
                                                ? "Internal Server Error"
                                                : err.message,
                        });
                });

                this.#setNotFoundRoute();
        }

        /**
         * Sets the 404 not found route.
         * @private
         */
        #setNotFoundRoute() {
                this.#expressServerInstance.use(async (req, res) => {
                        res.status(404)
                                .json({
                                        error: true,
                                        message: "Not found.",
                                })
                                .end();
                });
        }

        /**
         * Reads routes from the specified directory.
         *
         * @param {string} directory - The path to the routes directory.
         * @returns {Object} - An object where keys are the base paths and values are the router objects.
         */
        readRoutes(directory) {
                if (!fs.existsSync(directory))
                        throw new Error(
                                `Invalid routes directory '${directory}'.`,
                        );
                const routers = {};
                const files = fs.readdirSync(directory);
                files.forEach(async (file) => {
                        const filePath = path.join(directory, file);
                        if (
                                fs.statSync(filePath).isFile() &&
                                path.extname(file) === ".js"
                        ) {
                                const router = await import(filePath);
                                const basePath = `/${path.basename(file, ".js")}`;
                                routers[basePath] = router;
                        }
                });

                return routers;
        }
}

export default RouteManager;
