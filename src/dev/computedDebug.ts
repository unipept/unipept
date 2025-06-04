// @ts-nocheck

import { computed as originalComputed } from 'vue'

export function computedDebug<T>(getter: ComputedGetter<T>, name: string, debugOptions?: DebuggerOptions): ComputedRef<T> {
    const startTime = new Date().getTime();
    const result = originalComputed<T>(getter, debugOptions);
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    console.log(`Computed <>${name}<> took ${duration}ms`);
    return result;
}
