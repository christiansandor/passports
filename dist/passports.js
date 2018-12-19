"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const passport_1 = require("passport");
const session = require("express-session");
const crypto_1 = require("crypto");
const mainLogger = debug('passports');
class Passports {
    constructor() {
        this.instances = {};
    }
    setConfig(getConfigFunction) {
        this.getConfigFunction = getConfigFunction;
    }
    setInstance(createInstanceFunction) {
        this.createInstanceFunction = createInstanceFunction;
    }
    createExpressSession(options) {
        const { name = 'passports' } = options;
        return async (request, response, next) => {
            const cache = await this.getInstanceCache(request);
            if (!cache) {
                return next();
            }
            if (!cache.calls.session) {
                cache.logger('Setting up new express session');
                options.name = name + '.' + cache.hash;
                cache.calls.session = session(options);
            }
            cache.calls.session(request, response, next);
        };
    }
    middleware(method, ...args) {
        const id = Math.random().toString(36).substr(2);
        return async (request, response, next) => {
            const cache = await this.getInstanceCache(request);
            if (!cache) {
                return next();
            }
            if (!cache.calls[id]) {
                cache.logger(`Setting up instance middleware for ${method}`);
                cache.calls[id] = cache.instance[method].call(cache.instance, ...args);
            }
            cache.calls[id](request, response, next);
        };
    }
    initialize(...args) {
        return this.middleware('initialize', ...args);
    }
    session(...args) {
        return this.middleware('session', ...args);
    }
    authenticate(...args) {
        return this.middleware('authenticate', ...args);
    }
    authorize(...args) {
        return this.middleware('authorize', ...args);
    }
    async getInstanceCache(request) {
        if (!request.__passports_instance) {
            let config;
            try {
                config = await this.getConfigFunction(request);
            }
            catch (err) {
                mainLogger('Error while reading configuration');
                mainLogger(err);
                return null;
            }
            if (!config) {
                return null;
            }
            if (!this.instances[config.instanceId]) {
                const logger = debug('passports:' + config.instanceId);
                try {
                    const instance = new passport_1.Passport();
                    await this.createInstanceFunction(config.options, instance);
                    logger('Creating new instance');
                    this.instances[config.instanceId] = {
                        logger,
                        config,
                        instance,
                        hash: crypto_1.createHash('sha1').update(config.instanceId).digest('hex'),
                        calls: {},
                    };
                }
                catch (err) {
                    logger('Error while creating new instance');
                    logger(err);
                    return null;
                }
            }
            request.__passports_instance = this.instances[config.instanceId];
        }
        return request.__passports_instance;
    }
}
exports.Passports = Passports;
//# sourceMappingURL=passports.js.map