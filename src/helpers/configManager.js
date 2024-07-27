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
        constructor(configFilePath) {
                this.configFilePath = configFilePath;
                this.#loadConfig();
                this.allowedKeys = {
                        'app_env': 'string',
                        'local': {
                                'app_name': 'string',
                                'port': 'number',
                                'url': 'string',
                                'database': {
                                        'host': 'string',
                                        'user': 'string',
                                        'password': 'string',
                                        'port': 'number',
                                        'database': 'string'
                                },
                                'log': {
                                        'directory': 'string',
                                        'keep_files': 'boolean',
                                        'database_query': 'boolean'
                                },
                                'shopify': {
                                        'subscriptions_product_id': 'string',
                                        'subscriptions_product_id_backup': 'string',
                                        'X-Shopify-Access-Token': 'string',
                                        'X-Shopify-Access-Token_backup': 'string',
                                        'api_endpoint': {
                                                'graphql': 'string',
                                                'rest_back': 'string',
                                                'rest': 'string'
                                        }
                                }
                        },
                        'live': {
                                'app_name': 'string',
                                'port': 'number',
                                'url': 'string',
                                'database': {
                                        'host': 'string',
                                        'user': 'string',
                                        'password': 'string',
                                        'port': 'number',
                                        'database': 'string'
                                },
                                'log': {
                                        'directory': 'string',
                                        'keep_files': 'boolean',
                                        'database_query': 'boolean'
                                },
                                'shopify': {
                                        'subscriptions_product_id': 'string',
                                        'subscriptions_product_id_backup': 'string',
                                        'X-Shopify-Access-Token': 'string',
                                        'X-Shopify-Access-Token_backup': 'string',
                                        'api_endpoint': {
                                                'graphql': 'string',
                                                'rest': 'string',
                                                'rest_back': 'string'
                                        }
                                }
                        }
                };
                this.validateConfig(this.#config, this.allowedKeys);
        }

        /**
         * Loads the configuration file.
         * 
         * @returns {Object} - The parsed configuration object.
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
         * @param {Object} obj - The object to validate.
         * @param {Object} schema - The allowed keys schema.
         * @param {string} [path=''] - The current path in the object hierarchy.
         * @throws {InvalidConfigError} - Throws an error if an invalid key is found.
         * @private
         */
        validateConfig(config, allowedKeys, path = '') {
                for (const key in config) {
                        const fullPath = path ? `${path}.${key}` : key;

                        if (!(key in allowedKeys)) {
                                throw new Error(`Invalid key "${fullPath}" in configuration.`);
                        }

                        const expectedType = allowedKeys[key];
                        const actualValue = config[key];
                        const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

                        if (typeof expectedType === 'object' && actualType === 'object') {
                                this.validateConfig(actualValue, expectedType, fullPath);
                        } else if (expectedType !== actualType) {
                                throw new Error(`Invalid type for key "${fullPath}". Expected "${expectedType}" but got "${actualType}".`);
                        }
                }
        }

        getConfig(keyPath) {
                if (!keyPath) return this.#config[this.#config['app_env']];
                const keys = keyPath.split('.').map(e => e.toLowerCase());
                let result = this.#config[this.#config['app_env']];
                for (const key of keys) {
                        if (result && result.hasOwnProperty(key)) result = result[key];
                        else throw new InvalidConfigError(`'${key}' is invalid key for config.`);
                }
                return result;
        }
}

class ConfigError extends Error {
        constructor(message) {
                super(message);
        }
}

class InvalidConfigError extends ConfigError {
        constructor(message) {
                super(message);
        }
}

class ConfigFileNotFoundError extends ConfigError {
        constructor(path) {
                super('Config file not found at: ' + path);
        }
}

module.exports = ConfigManager;