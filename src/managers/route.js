import express from "express";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Authorization from "./authorization.js";
import Logger from "./logger.js";
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
		this.#databaseManagerInstance = databaseManagerInstance;
		this.#authorizationInstance = new Authorization();
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
				const { v4 } = await import("uuid");
				request["x-request-id"] = v4();
				response.setHeader("x-request-id", request["x-request-id"]);
				Logger.logRequest(request);
				try {
					request["__databaseConnection"] = await this.#databaseManagerInstance.acquireConnection(request["x-request-id"]);
					await request["__databaseConnection"].beginTransaction();
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
		console.log("ROUTES ==> ", routers);
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
			if (req["__databaseConnection"]) req["__databaseConnection"].rollback();
			res.status(500).json({
				error: true,
				message: err.message
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
		// console.log(this.#expressServerInstance._router.stack);
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
		// Add promise which will be fulfilled the routes 
		// and rejects any errors encountered while reading files
		Promise.all(
			files.map(async (file) => {
				const filePath = path.join(directory, file);
				if (fs.statSync(filePath).isFile() && path.extname(file) === ".js") {
					try {
						let router = await import(filePath);
						router = router.default || router;
						const basePath = `/${path.basename(file, ".js")}`;
						routers[basePath] = router;
					} catch (error) {
						console.error(`Error reading route file: ${filePath}`);
						console.error(error.stack);
					}
				}
			}),
		).then((data) => {
			return data;
		});
		// Await all promises and return the result
		// files.forEach(async (file) => {
		// const filePath = path.join(directory, file);
		// if (fs.statSync(filePath).isFile() && path.extname(file) === ".js") {
		// let router = await import(filePath);
		// router = router.default || router;
		// const basePath = `/${path.basename(file, ".js")}`;
		// routers[basePath] = router;
		// }
		// });
		// console.log("144 => ", routers);
		// return routers;
	}
}

export default RouteManager;
