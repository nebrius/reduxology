declare type Listener<T> = (data: T) => void;
declare type MatchingKeys<TRecord, TMatch, K extends keyof TRecord = keyof TRecord> = K extends (TRecord[K] extends TMatch ? K : never) ? K : never;
declare type VoidKeys<Record> = MatchingKeys<Record, void>;
declare class Emitter<TRecord, ActionVK extends VoidKeys<TRecord> = VoidKeys<TRecord>, ActionNVK extends Exclude<keyof TRecord, ActionVK> = Exclude<keyof TRecord, ActionVK>, DispatchVK extends VoidKeys<TRecord> = VoidKeys<TRecord>, DispatchNVK extends Exclude<keyof TRecord, DispatchVK> = Exclude<keyof TRecord, DispatchVK>> {
    private listeners;
    dispatch<P extends DispatchNVK>(action: P, data: TRecord[P]): void;
    dispatch<P extends DispatchVK>(action: P): void;
    listen<P extends ActionNVK>(action: P, listener: Listener<TRecord[P]>): void;
    listen<P extends ActionVK>(action: P, listener: () => void): void;
}
interface Actions {
    start: {
        bar: number;
    };
    run: {
        name: string;
        age: number;
    };
    stop: void;
}
declare const emitter: Emitter<Actions, "stop", "start" | "run", "stop", "start" | "run">;
