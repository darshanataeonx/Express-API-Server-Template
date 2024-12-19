import fs from "fs";
import path from "path";
import ConfigManager from "./config.js";

/**
 * Logger class file.
 * This class provides logging functionality for the application, allowing for
 * logging of informational messages, warnings, errors, and other log levels.
 *
 * Features:
 * - Logs messages to a specified output (console, file, etc.).
 * - Supports various log levels (info, warn, error, debug).
 * - Can be extended to include additional log handlers (e.g., external logging services).
 *
 * Usage:
 * const logger = new Logger();
 * logger.info('request123', 'This is an informational message.');
 * logger.error('request123', 'This is an error message.');
 *
 * @autor Darshan Ramjiyani
 * @version 2.0.0
 * @since 2024-07-26
 */

class Logger extends console.Console {
	/**
	 * @private {Object} STDOUT_COLORS
	 * @description
	 */
	#STDOUT_COLORS = {
		reset: "\x1b[0m",
		bright: "\x1b[1m",
		dim: "\x1b[2m",
		underscore: "\x1b[4m",
		blink: "\x1b[5m",
		reverse: "\x1b[7m",
		hidden: "\x1b[8m",
		fg: {
			Black: "\x1b[30m",
			Red: "\x1b[31m",
			Green: "\x1b[32m",
			Yellow: "\x1b[33m",
			Blue: "\x1b[34m",
			Magenta: "\x1b[35m",
			Cyan: "\x1b[36m",
			White: "\x1b[37m",
			Gray: "\x1b[90m",
		},

		bg: {
			Black: "\x1b[40m",
			Red: "\x1b[41m",
			Green: "\x1b[42m",
			Yellow: "\x1b[43m",
			Blue: "\x1b[44m",
			Magenta: "\x1b[45m",
			Cyan: "\x1b[46m",
			White: "\x1b[47m",
			Gray: "\x1b[100m",
		},
	};

	/**
	 * @private {Object} Config
	 * @description
	 */
	#CONFIG;

	/**
	 * Constructor to initialize the Logger class.
	 *
	 * @constructor
	 * @param {Object} configs - Configuration object of logger from config file.
	 */
	constructor(configs) {
		const { stdout, stderr } = Logger.getLogStreams(
			configs["directory"],
		);
		super(stdout, stderr);
		this.#CONFIG = configs;
		this.logLevels = {
			INFO: "Info",
			WARN: "Warn",
			ERROR: "Erro",
			DEBUG: "Debu",
			REQ: "Requ",
			RES: "Resp",
		};
	}

	/**
	 * Logs an informational message.
	 *
	 * @param {string} requestId - The unique identifier for the request.
	 * @param {string} message - The message to log.
	 */
	info(requestId, message) {
		this.log(this.logLevels.INFO, requestId, message);
	}

	/**
	 * Logs a warning message.
	 *
	 * @param {string} requestId - The unique identifier for the request.
	 * @param {string} message - The message to log.
	 */
	warn(requestId, message) {
		this.log(this.logLevels.WARN, requestId, message);
	}

	/**
	 * Logs an error message.
	 *
	 * @param {string} requestId - The unique identifier for the request.
	 * @param {string} message - The message to log.
	 */
	error(requestId, message) {
		this.log(this.logLevels.ERROR, requestId, message);
	}

	/**
	 * Logs a debug message.
	 *
	 * @param {string} requestId - The unique identifier for the request.
	 * @param {string} message - The message to log.
	 */
	debug(requestId, message) {
		this.log(this.logLevels.DEBUG, requestId, message);
	}

	req(id, url) {
		this.log(this.logLevels.REQ, id, url);
	}
	static res(id, message) {
		const instance = new Logger(
			new ConfigManager().getConfig("log"),
		);
		instance.res(id, message);
	}
	res(id, message) {
		this.log(this.logLevels.RES, id, message + "\n");
	}

	/**
	 * Logs a message with a specified log level.
	 *
	 * @private
	 * @param {string} level - The log level.
	 * @param {string} message - The message to log.
	 */
	log(level, id, message) {
		message = `${this.#STDOUT_COLORS.bright}${this.#STDOUT_COLORS.fg.Red}[${id}]${this.#STDOUT_COLORS.reset}${this.#getStdOutColorBasedOnLogLevel(level)}[${level}]${this.#STDOUT_COLORS.reset} ${message}`;
		console.log(message);
		message = message.replace(/\x1b\[\d+m/g, "");
		if (
			level === this.logLevels.ERROR ||
			level === this.logLevels.WARN
		) {
			super.error(`${new Date().toLocaleString()} ${message}`);
		} else {
			super.log(`${new Date().toLocaleString()} ${message}`);
		}
	}

	/**
	 * Gets the writable streams for today's log files, creating them if necessary.
	 *
	 * @static
	 * @param {string} directory - The directory where log files will be stored.
	 * @returns {Object} An object containing the stdout and stderr writable streams.
	 */
	static getLogStreams(directory) {
		const date = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format
		const stdoutPath = path.join(
			directory || "./src/logs",
			`stdout-${date}.log`,
		);
		const stderrPath = path.join(
			directory || "src/logs",
			`stderr-${date}.log`,
		);
		if (!fs.existsSync(directory))
			fs.mkdirSync(directory, { recursive: true });
		if (!fs.existsSync(stdoutPath))
			fs.writeFileSync(stdoutPath, "", { flag: "a" });
		if (!fs.existsSync(stderrPath))
			fs.writeFileSync(stderrPath, "", { flag: "a" });
		return {
			stdout: fs.createWriteStream(stdoutPath, {
				flags: "a",
			}),
			stderr: fs.createWriteStream(stderrPath, {
				flags: "a",
			}),
		};
	}

	#getStdOutColorBasedOnLogLevel(logLevel) {
		switch (logLevel) {
			case "Info":
				return this.#STDOUT_COLORS.fg.Blue;
			case "Warn":
				return this.#STDOUT_COLORS.fg.Yellow;
			case "Erro":
				return this.#STDOUT_COLORS.fg.Red;
			case "Debu":
				return this.#STDOUT_COLORS.fg.Magenta;
			case "Requ":
				return this.#STDOUT_COLORS.fg.Green;
			case "Resp":
				return this.#STDOUT_COLORS.fg.Green;
			default:
				return this.#STDOUT_COLORS.fg.White;
		}
	}

	static log(id, message) {
		const instance = new Logger(
			new ConfigManager().getConfig("log"),
		);
		instance.info(id ? id : "SYS", message);
	}

	logRequest(request) {
		this.req(request["__id"], `${this.#STDOUT_COLORS.fg.Yellow}[${request.method}]${this.#STDOUT_COLORS.reset} ${request.protocol}://${request.get("host")}${request.url}`);
		this.info(request["__id"], "Client IP address: " + (request.headers["x-forwarded-for"] || request.connection.remoteAddress).split(":").pop());
		this.info(request["__id"], `Method = ${request.method}, Query = ${JSON.stringify(request.query)}, Params = ${JSON.stringify(request.params)}, Body = ${JSON.stringify(request.body)}, Files = ${request.files ? "true" : "false"}`);
	}
}

export default Logger;
