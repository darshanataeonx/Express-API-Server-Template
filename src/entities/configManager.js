const fs = require('fs');

/**
 * Configuration Manager class.
 * This class is responsible for loading and validating configuration files.
 * 
 * Usage:
 * const configManager = new ConfigManager('./config.json');
 * 
 * @autor Darshan Ramjiyani
 * @version 2.0.0
 * @since 2024-07-26
 */
class ConfigManager {
        #config;

        /**
         * Creates an instance of ConfigManager.
         * 
         * @constructor
         * @param {string} configFilePath - The path to the configuration file.
         */
        constructor(configFilePath = __dirname+'/../../config.json') {
                this.configFilePath = configFilePath;
                this.#loadConfig();
                this.allowedKeys = {
                        "env": "string",
                        "local": {
                                "host": "string",
                                "url": "string",
                                "port": "number",
                                "database": {
                                        "host": "string",
                                        "user": "string",
                                        "password": "string",
                                        "database": "string",
                                        "port": "number",
                                        "waitForConnections": "boolean",
                                        "connectionLimit": "number",
                                        "queueLimit": "number"
                                },
                                "log": {
                                        "directory": "string"
                                }
                        }
                };
                this.validateConfig(this.#config, this.allowedKeys);
        }

        /**
         * Loads the configuration file.
         * 
         * @returns {Object} - The parsed configuration object.
         * @throws {ConfigFileNotFoundError} - Throws an error if the configuration file is not found.
         * @private
         */
        #loadConfig() {
                if (!fs.existsSync(this.configFilePath)) {
                        throw new ConfigFileNotFoundError(this.configFilePath);
                }
                this.#config = JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8'));
        }

        /**
         * Recursively validates an object against allowed keys.
         * 
         * @param {Object} config - The object to validate.
         * @param {Object} allowedKeys - The allowed keys schema.
         * @param {string} [path=''] - The current path in the object hierarchy.
         * @throws {InvalidConfigError} - Throws an error if an invalid key is found or if a key has an incorrect type.
         * @private
         */
        validateConfig(config, allowedKeys, path = '') {
                for (const key in config) {
                        const fullPath = path ? `${path}.${key}` : key;

                        if (!(key in allowedKeys)) {
                                throw new InvalidConfigError(`Invalid key "${fullPath}" in configuration.`);
                        }

                        const expectedType = allowedKeys[key];
                        const actualValue = config[key];
                        const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

                        if (typeof expectedType === 'object' && actualType === 'object') {
                                this.validateConfig(actualValue, expectedType, fullPath);
                        } else if (expectedType !== actualType) {
                                throw new InvalidConfigError(`Invalid type for key "${fullPath}". Expected "${expectedType}" but got "${actualType}".`);
                        }
                }
        }

        /**
         * Retrieves the configuration value for a given key path.
         * 
         * @param {string} [keyPath] - The dot-separated key path to the configuration value.
         * @returns {*} - The configuration value.
         * @throws {InvalidConfigError} - Throws an error if the key path is invalid.
         */
        getConfig(keyPath) {
                if (!keyPath) return this.#config[this.#config['env']];
                const keys = keyPath.split('.').map(e => e.toLowerCase());
                let result = this.#config[this.#config['env']];
                for (const key of keys) {
                        if (result && result.hasOwnProperty(key)) result = result[key];
                        else throw new InvalidConfigError(`'${key}' is invalid key for config.`);
                }
                return result;
        }
}

/**
 * Base class for configuration-related errors.
 * 
 * @class
 * @extends {Error}
 */
class ConfigError extends Error {
        constructor(message) {
                super(message);
        }
}

/**
 * Error class for invalid configuration.
 * 
 * @class
 * @extends {ConfigError}
 */
class InvalidConfigError extends ConfigError {
        constructor(message) {
                super(message);
        }
}

/**
 * Error class for missing configuration file.
 * 
 * @class
 * @extends {ConfigError}
 */
class ConfigFileNotFoundError extends ConfigError {
        constructor(path) {
                super('Config file not found at: ' + path);
        }
}

module.exports = ConfigManager;