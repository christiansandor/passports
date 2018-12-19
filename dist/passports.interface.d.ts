import * as passport from 'passport';
import * as e from 'express';
import { Request } from 'express';
import { SessionOptions } from 'express-session';
import { AuthenticateOptions } from 'passport';
import { IDebugger } from 'debug';
declare type Ret<T> = (request: IPassportsRequest<T>, response: e.Response, next: e.NextFunction) => any;
export interface ITenantConfig<T> {
    instanceId: string;
    options: T;
}
interface IPassportsCache<T> {
    logger: IDebugger;
    config: ITenantConfig<T>;
    hash: string;
    instance: passport.Authenticator;
    calls: {
        [key: string]: e.RequestHandler;
    };
}
export interface IPassportsCacheMap<T> {
    [key: string]: IPassportsCache<T>;
}
export interface IPassportsRequest<T> extends Request {
    __passports_instance: IPassportsCache<T>;
}
export declare type GetConfigFunction<T> = (request: Request) => Promise<ITenantConfig<T>>;
export declare type CreateInstanceFunction<T> = (options: T, passport: passport.Authenticator) => Promise<void>;
export interface IPassports<T> {
    setConfig(getConfigFunction: GetConfigFunction<T>): void;
    setInstance(createInstanceFunction: CreateInstanceFunction<T>): void;
    createExpressSession(options: SessionOptions, passportSessionOptions?: {
        pauseStream: boolean;
    }): Ret<T>;
    middleware(method: keyof passport.Authenticator, ...args: any[]): Ret<T>;
    initialize(options?: {
        userProperty: string;
    }): Ret<T>;
    session(options?: {
        pauseStream: boolean;
    }): Ret<T>;
    authenticate(strategy: string | string[], callback?: (...args: any[]) => any): Ret<T>;
    authenticate(strategy: string | string[], options: AuthenticateOptions, callback?: (...args: any[]) => any): Ret<T>;
    authorize(strategy: string | string[], callback?: (...args: any[]) => any): Ret<T>;
    authorize(strategy: string | string[], options: any, callback?: (...args: any[]) => any): Ret<T>;
}
export {};
