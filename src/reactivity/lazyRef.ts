import {customRef} from "vue";

export function lazyRef<T>(value?: T | undefined) {
    return customRef((track, trigger) => {
        return {
            get() {
                //track();
                return value;
            },
            set(newValue) {
                value = newValue;
                //trigger();
            }
        };
    });
}
