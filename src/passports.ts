import * as debug from 'debug';

import * as passport from 'passport';
import {Passport} from 'passport';
import * as session from 'express-session';
import {SessionOptions} from 'express-session';
import {NextFunction, Response} from 'express';
import {createHash} from 'crypto';
import {
    CreateInstanceFunction,
    GetConfigFunction,
    IPassports,
    IPassportsCacheMap,
    IPassportsRequest,
    ITenantConfig,
} from './passports.interface';

const mainLogger = debug('passports');

export class Passports<T> implements IPassports<T> {
    private readonly instances: IPassportsCacheMap<T> = {};
    private getConfigFunction: GetConfigFunction<T>;
    private createInstanceFunction: CreateInstanceFunction<T>;

    public setConfig(getConfigFunction: GetConfigFunction<T>) {
        this.getConfigFunction = getConfigFunction;
    }

    public setInstance(createInstanceFunction: CreateInstanceFunction<T>) {
        this.createInstanceFunction = createInstanceFunction;
    }

    public createExpressSession(options: SessionOptions) {
        const {name = 'passports'} = options;
        return async (request: IPassportsRequest<T>, response: Response, next: NextFunction) => {
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

    public middleware(method: keyof passport.Authenticator, ...args: any[]) {
        const id = Math.random().toString(36).substr(2);
        return async (request: IPassportsRequest<T>, response: Response, next: NextFunction) => {
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

    public initialize(...args: any[]) {
        return this.middleware('initialize', ...args);
    }

    public session(...args: any[]) {
        return this.middleware('session', ...args);
    }

    public authenticate(...args: any[]) {
        return this.middleware('authenticate', ...args);
    }

    public authorize(...args: any[]) {
        return this.middleware('authorize', ...args);
    }

    private async getInstanceCache(request: IPassportsRequest<T>) {
        if (!request.__passports_instance) {
            let config: ITenantConfig<T>;
            try {
                config = await this.getConfigFunction(request);
            } catch (err) {
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
                    const instance = new Passport() as passport.Authenticator;
                    await this.createInstanceFunction(config.options, instance);

                    logger('Creating new instance');
                    this.instances[config.instanceId] = {
                        logger,
                        config,
                        instance,
                        hash: createHash('sha1').update(config.instanceId).digest('hex'),
                        calls: {},
                    };
                } catch (err) {
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
