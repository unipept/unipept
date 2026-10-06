import {describe, expect, it, vi} from "vitest";
import {ShareableMap} from "shared-memory-datastructures";
import CountTable from "@/logic/processors/CountTable";
import FunctionalAnalysisProcessor from "@/logic/processors/functional/FunctionalAnalysisProcessor";

// Like the real Peptonizer: peptonize() only settles when the test resolves it, and never after a cancel
const resolvers = vi.hoisted(() => [] as ((result: Map<string, number>) => void)[]);

vi.mock("peptonizer", () => ({
    Peptonizer: class {
        peptonize() {
            return new Promise(resolve => resolvers.push(resolve));
        }

        cancel() {
            // The promise of peptonize() is left pending, like the real Peptonizer does
        }
    }
}));

const run = (processor: FunctionalAnalysisProcessor) => {
    const counts = new ShareableMap<string, number>();
    counts.set("AAAAAK", 1);

    return processor.runFunctionalAnalysis(
        new Map([["AAAAAK", ["EC:1.1.1.1"]]]),
        new CountTable(counts),
        false
    );
};

// Lets the queued tasks start
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe("FunctionalAnalysisProcessor", () => {
    it("should cancel a run that waits in the queue without starting it", async () => {
        const first = new FunctionalAnalysisProcessor();
        const second = new FunctionalAnalysisProcessor();
        const firstResult = run(first);
        const secondResult = run(second);
        await flush();

        second.cancelFunctionalAnalysis();
        expect(await secondResult).toBeUndefined();

        resolvers[0](new Map([["0", 0.9]]));
        expect(await firstResult).toEqual(new Map([["EC:1.1.1.1", 0.9]]));
        await flush();
        expect(resolvers).toHaveLength(1);
    });

    it("should not block the queue when a running analysis is cancelled", async () => {
        resolvers.length = 0;
        const first = new FunctionalAnalysisProcessor();
        const firstResult = run(first);
        await flush();

        first.cancelFunctionalAnalysis();
        expect(await firstResult).toBeUndefined();

        const secondResult = run(new FunctionalAnalysisProcessor());
        await flush();
        resolvers[1](new Map([["0", 0.4]]));
        expect(await secondResult).toEqual(new Map([["EC:1.1.1.1", 0.4]]));
    });
});
