import {describe, it, expect, assert} from './test-utils';
import { auto } from '../lib';

const {resolve} = Promise;

function delayedResolve<T>(resolution: T, delayMs: number) {
    return new Promise<T>((res, rej) => {
        setTimeout(() => {
            res(resolution);
        }, delayMs);
    });
}

function delayedReject(rejection: any, delayMs: number) {
    return new Promise<never>((res, rej) => {
        setTimeout(() => {
            rej(rejection);
        }, delayMs);
    })
}

function delayedAction(delayMs: number, action: () => PromiseLike<any> | void) {
    return delayedResolve(null, delayMs).then(res => {
        return action();
    });
}

// invoke a bunch of async functions in parallel; resolve when their returned promises have all resolved
function doParallel(...args: Array<() => PromiseLike<any>>)  {
    return Promise.all(args.map(v => v()));
}

/** Helper to assert that things happen in a certain order */
function assertOrdering() {
    let nextStep: 'first' | 'second' | 'third' | 'fourth' | 'fifth' = 'first';
    return {
        first() {
            assert.equal(nextStep, 'first');
            nextStep = 'second';
        },
        second() {
            assert.equal(nextStep, 'second');
            nextStep = 'third';
        },
        third() {
            assert.equal(nextStep, 'third');
            nextStep = 'fourth';
        },
        fourth() {
            assert.equal(nextStep, 'fourth');
            nextStep = 'fifth';
        }
    };
}

describe('auto', () => {
    it('synchronously invokes all task functions', async () => {
        let tasksStarted = 0;
        auto({
             async foo() {
                tasksStarted++;
             },
             async bar() {
                tasksStarted++;
             },
             async baz() {
                tasksStarted++;
             }
        });
        assert.equal(tasksStarted, 3);
    });

    it('resolves with resolution value of each task', async () => {
        const result = await auto({
            async foo() {
                return 'foo value';
            },
            async bar() {
                return 'bar value';
            },
            async baz() {
                return delayedResolve('baz value', 100);
            }
        });
        assert.deepEqual(result, {
            foo: 'foo value',
            bar: 'bar value',
            baz: 'baz value'
        });
    });

    it('waits for all task functions to resolve before returning', async () => {
        const {first, second} = assertOrdering();

        setTimeout(() => {
            first();
        }, 100);

        await auto({
            async foo() {
                return delayedResolve('foo', 300);
            },
            async bar() {
                return delayedResolve('bar', 200);
            }
        }).then(res => {
            assert.equal(res.foo, 'foo');
            assert.equal(res.bar, 'bar');
            second();
        });
    });

    it('rejects immediately when any of the task functions reject', async () => {
        const {first, second, third} = assertOrdering();
        const resultPromise = auto({
            async foo() {
                return Promise.resolve('foo resolution');
            },
            async bar() {
                return delayedReject('bar rejection', 100);
            },
            async baz() {
                return delayedResolve('baz resolution', 200);
            }
        });

        first();
        await doParallel(
            async () => {
                // ensure rejection happens after bar rejects and before baz resolves
                await delayedAction(150, () => {
                    third();
                });
            },
            async () => {
                try {
                    await resultPromise;
                } catch(e) {
                    second();
                    assert.equal(e, 'bar rejection');
                    return;
                }
                assert.fail('Error should have been thrown');
            }
        );
    });

    it('provides resolution value of one task to all other tasks', async () => {
        const result = await auto({
            async foo() {
                return delayedResolve('foo value', 100);
            },
            async bar() {
                return `bar resolving with foo and baz values: ${ await this.foo } ${ await this.baz }`;
            },
            async baz() {
                return 'baz value';
            }
        });
        assert.deepEqual(result, {
            foo: 'foo value',
            bar: 'bar resolving with foo and baz values: foo value baz value',
            baz: 'baz value'
        });

    });

    it('exposes rejections of one task to other tasks', async () => {
        let rejectionOfBar;
        try {
            await auto({
                async foo() {
                    try {
                        await this.bar;
                    } catch(barRejection) {
                        rejectionOfBar = barRejection;
                    }
                },
                async bar() {
                    throw 'bar is rejected';
                }
            });
        } catch {}
        assert.equal(rejectionOfBar, 'bar is rejected');
    });
});