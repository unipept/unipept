import { describe, it, expect, vi } from 'vitest';
import AsyncHelper from './AsyncHelper';

describe('AsyncHelper', () => {
    it('should execute mutation for a single call', async () => {
        const helper = new AsyncHelper<string>();
        const mutation = vi.fn();

        await helper.performIfLast(async () => 'result', mutation);

        expect(mutation).toHaveBeenCalledWith('result');
        expect(helper.isExecuting().value).toBe(false);
    });

    it('should only execute mutation for the last call when multiple calls are made', async () => {
        const helper = new AsyncHelper<string>();
        const mutation = vi.fn();

        let resolve1: (val: string) => void;
        const p1 = new Promise<string>(r => resolve1 = r);

        let resolve2: (val: string) => void;
        const p2 = new Promise<string>(r => resolve2 = r);

        // Call 1
        const promise1 = helper.performIfLast(() => p1, mutation);
        expect(helper.isExecuting().value).toBe(true);

        // Call 2
        const promise2 = helper.performIfLast(() => p2, mutation);
        expect(helper.isExecuting().value).toBe(true);

        // Resolve 1 first
        resolve1!('result1');
        await promise1;

        // Mutation should NOT have been called yet (because it wasn't the last call)
        expect(mutation).not.toHaveBeenCalled();

        // Resolve 2
        resolve2!('result2');
        await promise2;

        // Mutation should be called with result2
        expect(mutation).toHaveBeenCalledTimes(1);
        expect(mutation).toHaveBeenCalledWith('result2');
        expect(helper.isExecuting().value).toBe(false);
    });

    it('should handle out-of-order completion', async () => {
        const helper = new AsyncHelper<string>();
        const mutation = vi.fn();

        let resolve1: (val: string) => void;
        const p1 = new Promise<string>(r => resolve1 = r);

        let resolve2: (val: string) => void;
        const p2 = new Promise<string>(r => resolve2 = r);

        // Call 1
        const promise1 = helper.performIfLast(() => p1, mutation);

        // Call 2
        const promise2 = helper.performIfLast(() => p2, mutation);

        // Resolve 2 (the last one) FIRST
        resolve2!('result2');
        await promise2;

        // Mutation SHOULD be called because it is the last call initiated
        expect(mutation).toHaveBeenCalledWith('result2');
        expect(helper.isExecuting().value).toBe(false);

        // Resolve 1
        resolve1!('result1');
        await promise1;

        // Mutation should still be called only once (for result2)
        expect(mutation).toHaveBeenCalledTimes(1);
    });
});
