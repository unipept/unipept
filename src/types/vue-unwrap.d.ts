import type { ShareableMap } from "shared-memory-datastructures";

// Vue unwraps the types of nested refs, and with that it turns a ShareableMap into a plain Map. Stores that hold other
// stores then get a type that no longer matches the original store. Classes listed here keep their own type.
declare module "@vue/reactivity" {
    export interface RefUnwrapBailTypes {
        unipeptClasses: ShareableMap<unknown, unknown>;
    }
}
