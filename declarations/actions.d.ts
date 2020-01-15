export declare type ActionCreator = (...args: any[]) => any;
export interface RegisterActionOptions {
    type: string;
    creator: ActionCreator;
}
export declare function registerAction(options: RegisterActionOptions): void;
export declare function registerAction(type: string, creator: ActionCreator): void;
