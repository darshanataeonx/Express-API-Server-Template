import express from "express";
import helmet from "helmet";
// import Authorization from "./authorization.js";
import Logger from "./logger.js";
import routes from "../routes/index.js";
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
	#authorizationInstance;
	/**
	 * Creates an instance of RouteManager.
	 *
	 * @constructor
	 * @param {object} expressServerInstance - The Express server instance.
	 * @param {object} databaseManagerInstance - The instance of the DatabaseManager class.
	 */
	constructor(expressServerInstance, databaseManagerInstance) {
		this.#expressServerInstance = expressServerInstance;
		this.databaseManagerInstance = databaseManagerInstance;
		// this.#authorizationInstance = new Authorization();
		this.#setEssentialRoutes();
	}

	/**
	 * Sets essential routes and middleware for the Express server.
	 * @private
	 */
	async #setEssentialRoutes() {
		this.#expressServerInstance.use(express.json());
		this.#expressServerInstance.use(helmet());
		this.#expressServerInstance.use(
			async (request, response, next) => {
				const { v4 } = await import("uuid");
				request["x-request-id"] = v4();
				response.setHeader("x-request-id", request["x-request-id"]);
				Logger.logRequest(request);
				try {
					await this.databaseManagerInstance.acquireConnection(request["x-request-id"]);
					request["__databaseConnection"] = this.databaseManagerInstance;
					await this.databaseManagerInstance.beginTransaction();
				} catch (error) {
					return next(error);
				}
				response.on("finish", async () => {
					Logger.res(request["x-request-id"], `Response status = ${response.statusCode}`);
					await this.databaseManagerInstance.release();
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
		this.#expressServerInstance.use(routes);
		this.#setErrorHandlingRoute();
	}

	/**
	 * Sets the error handling route.
	 * @private
	 */
	async #setErrorHandlingRoute() {
		this.#expressServerInstance.use(async (err, req, res, next) => {
			console.error(err.stack);
			if (req["__databaseConnection"]) await this.databaseManagerInstance.rollbackTransaction();
			res.status(500).json({ error: true, message: err.message });
		});
		this.#setNotFoundRoute();
	}

	/**
	 * Sets the 404 not found route.
	 * @private
	 */
	#setNotFoundRoute() {
		this.#expressServerInstance.use(async (req, res) => {
			res.status(404).json({ error: true, message: "Not found." }).end();
		});
	}
}

export default RouteManager;
