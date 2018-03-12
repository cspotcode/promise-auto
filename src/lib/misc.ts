export type TODO = any;

export interface Dictionary<T> {
    [p: string]: T;
}

export type UnwrapReturnValue<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;
export type UnwrapPropReturnValues<T extends Dictionary<(...args: any[]) => R>, R = any> = {
    [K in keyof T]: UnwrapReturnValue<T[K]>;
}
export type UnwrapPromise<T extends PromiseLike<Ret>, Ret = any> = T extends PromiseLike<infer R> ? R : never;
export type UnwrapPropPromises<T extends Dictionary<PromiseLike<any>>> = {
    [K in keyof T]: UnwrapPromise<T[K]>;
}
export type FunctionDictionary<PromiseDict extends {[P in keyof ValueDict]: PromiseLike<ValueDict[P]>}, ValueDict> = {
    [P in keyof PromiseDict]: (o: PromiseDict) => PromiseDict[P];
}

export type ReimposeKeyofConstraint<T extends keyof V, V> = T;

