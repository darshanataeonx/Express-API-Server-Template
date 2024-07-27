const fs = require('fs');

/**
 * Configuration Manager class.
 * This class is responsible for loading and validating configuration files.
 * 
 * Usage:
 * const configManager = new ConfigManager('./config.json');
 * configManager.validateConfig();
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
                        'app_env': ['live', 'local'],
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
         * Validates the loaded configuration against allowed keys.
         * 
         * @throws {InvalidConfigError} - Throws an error if an invalid key is found.
         */
        validateConfig() {
                this.validateObject(this.config, this.allowedKeys);
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
        validateObject(obj, schema, path = '') {
                if (typeof obj !== 'object' || obj === null) throw new InvalidConfigError(`Invalid type at path: ${path}. Expected an object.`);
                Object.keys(obj).forEach(key => {
                        const fullPath = path ? `${path}.${key}` : key;
                        if (!(key in schema)) throw new InvalidConfigError(`Unexpected key: ${fullPath}`);
                        const expectedType = schema[key];
                        const value = obj[key];
                        if (typeof expectedType === 'string') {
                                if (typeof value !== expectedType)
                                        throw new InvalidConfigError(`Invalid type at path: ${fullPath}. Expected ${expectedType}, got ${typeof value}.`);
                        }
                        else if (typeof expectedType === 'object') this.validateObject(value, expectedType, fullPath);
                        else throw new InvalidConfigError(`Invalid schema type at path: ${fullPath}`);
                });
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