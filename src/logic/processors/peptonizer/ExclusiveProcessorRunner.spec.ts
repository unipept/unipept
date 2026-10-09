import {describe, expect, it} from "vitest";
import ExclusiveProcessorRunner from "@/logic/processors/peptonizer/ExclusiveProcessorRunner";

describe("ExclusiveProcessorRunner", () => {
    it("should not pass an error of a task to the tasks that wait for it", async () => {
        const runner = new ExclusiveProcessorRunner<number>();

        const first = runner.run(async () => { throw new Error("first task failed"); });
        const second = runner.run(async () => 2);

        await expect(first).rejects.toThrow("first task failed");
        expect(await second).toBe(2);
    });
});
