const fs = require('fs');
const path = require('path');

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
        #STDOUT_COLORS = {};

        /**
         * @private {Object} CONFIG
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
                const { stdout, stderr } = Logger.getLogStreams(configs['directory']);
                super(stdout, stderr);
                this.#CONFIG = configs;
                this.logLevels = {
                        INFO: 'Info',
                        WARN: 'Warn',
                        ERROR: 'Error',
                        DEBUG: 'Debug'
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

        /**
         * Logs a message with a specified log level.
         * 
         * @private
         * @param {string} level - The log level.
         * @param {string} message - The message to log.
         */
        log(level, id, message) {
                message = `[${id}] [${level}]\t: ${message}`;
                console.log(message);
                if (level === this.logLevels.ERROR || level === this.logLevels.WARN) {
                        super.error(`${require('dayjs')().format("DD-MM-YYYY hh:mm:ss")}:` + message);
                } else {
                        super.log(`${require('dayjs')().format("DD-MM-YYYY hh:mm:ss")}:` + message);
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
                const date = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
                const stdoutPath = path.join(directory || 'src/logs', `stdout-${date}.log`);
                const stderrPath = path.join(directory || 'src/logs', `stderr-${date}.log`);
                if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
                if (!fs.existsSync(stdoutPath)) fs.writeFileSync(stdoutPath, '', { flag: 'a' });
                if (!fs.existsSync(stderrPath)) fs.writeFileSync(stderrPath, '', { flag: 'a' });
                return {
                        stdout: fs.createWriteStream(stdoutPath, { flags: 'a' }),
                        stderr: fs.createWriteStream(stderrPath, { flags: 'a' })
                };
        }
}

module.exports = Logger;