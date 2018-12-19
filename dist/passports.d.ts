import * as passport from 'passport';
import { SessionOptions } from 'express-session';
import { NextFunction, Response } from 'express';
import { CreateInstanceFunction, GetConfigFunction, IPassports, IPassportsRequest } from './passports.interface';
export declare class Passports<T> implements IPassports<T> {
    private readonly instances;
    private getConfigFunction;
    private createInstanceFunction;
    setConfig(getConfigFunction: GetConfigFunction<T>): void;
    setInstance(createInstanceFunction: CreateInstanceFunction<T>): void;
    createExpressSession(options: SessionOptions): (request: IPassportsRequest<T>, response: Response, next: NextFunction) => Promise<void>;
    middleware(method: keyof passport.Authenticator, ...args: any[]): (request: IPassportsRequest<T>, response: Response, next: NextFunction) => Promise<void>;
    initialize(...args: any[]): (request: IPassportsRequest<T>, response: Response, next: NextFunction) => Promise<void>;
    session(...args: any[]): (request: IPassportsRequest<T>, response: Response, next: NextFunction) => Promise<void>;
    authenticate(...args: any[]): (request: IPassportsRequest<T>, response: Response, next: NextFunction) => Promise<void>;
    authorize(...args: any[]): (request: IPassportsRequest<T>, response: Response, next: NextFunction) => Promise<void>;
    private getInstanceCache;
}
