declare type MatchingKeys<TRecord, TMatch, K extends keyof TRecord = keyof TRecord> = K extends (TRecord[K] extends TMatch ? K : never) ? K : never;
export declare type VoidKeys<Record> = MatchingKeys<Record, void>;
export {};
