import { Dictionary, TODO } from './misc';

export async function auto<ValueDict>(
    tasks: {
        [P in keyof ValueDict]: (
            this: {[P2 in keyof ValueDict]: P2 extends P ? never : PromiseLike<ValueDict[P2]>},
            o:    {[P2 in keyof ValueDict]: P2 extends P ? never : PromiseLike<ValueDict[P2]>}
        ) => PromiseLike<ValueDict[P]>
    }
): Promise<ValueDict> {
    type Key = keyof ValueDict;
    const keys = Object.keys(tasks) as Key[];
    /** Dictionary of promises; passed to async functions */
    const promisesDict:             { [K in Key]: Promise<ValueDict[K]> } = {} as any;
    /** Dictionary of resolved values; returned once *all* async functions have resolved */
    const valuesDict:               { [K in Key]: ValueDict[K] } = {} as any;
    /** Resolve and reject callbacks for each promise */
    const resolveRejectCallbacks:   { [K in Key]: {resolve: (v: PromiseLike<ValueDict[K]> | ValueDict[K]) => void, reject: (err: any) => void} } = {} as any;
    /** Array of all promises, so we can Promise.all them */
    const allResultPromises = [];
    for(const key of keys) {
        allResultPromises.push(
            promisesDict[key] = new Promise((resolve, reject) => {
                resolveRejectCallbacks[key] = {resolve, reject};
            })
        );
    }
    // Invoke each factory fn, passing the dictionary of promises as both `this` and first argument
    for(const key of keys) {
        const {resolve, reject} = resolveRejectCallbacks[key];
        tasks[key].call(promisesDict, promisesDict).then((v: TODO) => {
            valuesDict[key] = v;
            resolve(v);
        }, reject);
    }
    await Promise.all(allResultPromises);
    return valuesDict;
}
