let wkr = require("mpa/worker.js");
let fetchMock = require("../test_helpers/fetch_mock.js");

// catch undefined "postMessage" for 1 arg
let old = self.postMessage;
self.postMessage = function (...args) {
    if (args.length === 1) return;
    old(...args);
};

// setup a fetch mock function
beforeEach(function () {
    fetchMock.setup({
        "/mpa/pept2data": [
            {
                test: data => data.method === "POST" && "body" in data,
                value: data => {
                    let p = JSON.parse(data.body).peptides;
                    return {peptides: require("./testmpadata.json").filter(x => p.includes(x.sequence))};
                },
            },
        ],
        "/private_api/goterms": [
            {
                test: data => data.method === "POST" && "body" in data,
                value: data => {
                    let selected = JSON.parse(data.body).goterms;
                    return require("./goterms.json").filter(x => selected.includes(x.code));
                },
            },
        ],
        "/private_api/ecnumbers": [
            {
                test: data => data.method === "POST" && "body" in data,
                value: data => {
                    let selected = JSON.parse(data.body).ecnumbers;
                    return require("./ecnums.json").filter(x => selected.includes(x.code));
                },
            },
        ],


    });
});


afterEach(function () {
    wkr.clean();
});

it("should have an GO and EC data should be empty", () => {
    expect(wkr.getGoData()).toEqual(new Map());
    expect(wkr.getEcNames()).toEqual(new Map([["-.-.-.-", "Enzyme Commission Numbers"]]));
});

describe("Should be correct (default config)", () => {
    it("for AALTER", async () => {
        expect.assertions(3);

        let pepts = ["AALTER"];
        await expect(wkr.process(pepts, {})).resolves.toEqual({
            processed: [["AALTER", Object.assign({count: 1}, exDataAALTER)]],
            missed: [],
            numMatched: 1,
            numSearched: 1,
        });

        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
    });

    it("for NOFADATA (no FA data availible)", async () => {
        let pepts = ["NOFADATA"];
        await expect(wkr.process(pepts, {})).resolves.toEqual({
            "missed": [],
            "numMatched": 1,
            "numSearched": 1,
            "processed": [["NOFADATA", {"count": 1, "fa": {"counts": {"all": 0}}, "lca": 541000, "lineage": [2, null, null, null, 1239, null, null, 186801, null, null, null, 186802, null, null, null, null, 541000, null, null, null, null, null, null, null, null, null, null, null], "sequence": "NOFADATA"}]],
        });
        let r = await wkr.summarizeGo();
        await expect(r).toHaveProperty("data",
            {"biological process": [], "cellular component": [], "molecular function": []});
        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
            []);
    });


    it("if there are no matches", async () => {
        expect.assertions(3);

        let pepts = ["MISSES"];
        await expect(wkr.process(pepts, {})).resolves.toEqual({
            processed: [],
            missed: ["MISSES"],
            numMatched: 0,
            numSearched: 1,
        });

        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
            []);
        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
            {"biological process": [], "cellular component": [], "molecular function": []});
    });

    it("for shorter than 5 (empty result)", async () => {
        expect.assertions(3);

        let pepts = ["AALT"];
        await expect(wkr.process(pepts, {})).resolves.toEqual({
            processed: [],
            missed: [],
            numMatched: 0,
            numSearched: 0,
        });

        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
            []);
        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
            {"biological process": [], "cellular component": [], "molecular function": []});
    });

    it("for a lot of data", async () => {
        expect.assertions(1);

        let pepts = require("./humangut.json");
        await expect(wkr.process(pepts, {missed: true, il: true})).resolves.toMatchObject({
            missed: expect.arrayContaining(["AAVESGSAAASR", "TEGNYVVVNYSAEPATSDELDR"]),
            numMatched: 5,
            numSearched: 3983,
        });
    });
});


describe("Should handle config correctly", () => {
    it("for IL", async () => {
        let pepts = ["AALTER"];
        await expect(wkr.process(pepts, {il: true})).resolves.toEqual({
            processed: [["AALTER", Object.assign({count: 1}, exDataAALTER)]],
            missed: [],
            numMatched: 1,
            numSearched: 1,
        });


        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
    });

    describe("for duplicates", () => {
        it("true", async () => {
            let pepts = ["AALTER", "AALTER", "AALTER", "AALTER"];
            await expect(wkr.process(pepts, {dupes: true})).resolves.toEqual({
                processed: [["AALTER", Object.assign({count: 1}, exDataAALTER)]],
                missed: [],
                numMatched: 1,
                numSearched: 1,
            });

            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
        });

        it("false", async () => {
            let pepts = ["AALTER", "AALTER", "AALTER", "AALTER"];
            await expect(wkr.process(pepts, {dupes: false})).resolves.toEqual({
                processed: [["AALTER", Object.assign({count: 4}, exDataAALTER)]],
                missed: [],
                numMatched: 4,
                numSearched: 4,
            });


            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 4, "value": 1, "weightedValue": 4}], "molecular function": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 4, "value": 0.3333333333333333, "weightedValue": 4}, {"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 4, "value": 0.3333333333333333, "weightedValue": 4}, {"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 4, "value": 0.3333333333333333, "weightedValue": 4}]});
            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data", [{"absoluteCount": 4, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 4, "value": 0.5, "weightedValue": 2}, {"absoluteCount": 4, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 4, "value": 0.5, "weightedValue": 2}]);
        });
    });

    describe("for advanced missed cleavage handeling", () => {
        it("true", async () => {
            let pepts = ["AALTER"];
            await expect(wkr.process(pepts, {missed: true})).resolves.toEqual({
                processed: [["AALTER", Object.assign({count: 1}, exDataAALTER)]],
                missed: [],
                numMatched: 1,
                numSearched: 1,
            });

            await expect(JSON.parse(fetchMock.getMock().calls[0][1].body)).toHaveProperty("missed", true);


            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
        });

        it("false", async () => {
            let pepts = ["AALTER"];
            await expect(wkr.process(pepts, {missed: false})).resolves.toEqual({
                processed: [["AALTER", Object.assign({count: 1}, exDataAALTER)]],
                missed: [],
                numMatched: 1,
                numSearched: 1,
            });

            await expect(JSON.parse(fetchMock.getMock().calls[0][1].body)).toHaveProperty("missed", false);

            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
        });
    });
});


describe("Should get correct FAs", () => {
    beforeEach(async () => {
        await wkr.process(["AALTER", "AAYLFNALPTK"], {});
    });
    it("with cutoff 0", async () => {
        await expect(wkr.summarizeGo(0)).resolves.toHaveProperty("data", {"biological process": [{"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000017", "numberOfPepts": 1, "value": 0.2631578947368421, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000009", "numberOfPepts": 1, "value": 0.2631578947368421, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000012", "numberOfPepts": 1, "value": 0.2631578947368421, "weightedValue": 1}, {"absoluteCount": 4, "absoluteCountFiltered": 4, "code": "GO:0000011", "numberOfPepts": 1, "value": 0.2105263157894737, "weightedValue": 0.8}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 4, "absoluteCountFiltered": 4, "code": "GO:0000002", "numberOfPepts": 2, "value": 0.37499999999999994, "weightedValue": 1.2}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3125, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3125, "weightedValue": 1}]});
        await expect(wkr.summarizeEc(0)).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
    });

    it("with cutoff 50", async () => {
        await expect(wkr.summarizeGo(50)).resolves.toHaveProperty("data", {"biological process": [{"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000017", "numberOfPepts": 1, "value": 0.2631578947368421, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000009", "numberOfPepts": 1, "value": 0.2631578947368421, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000012", "numberOfPepts": 1, "value": 0.2631578947368421, "weightedValue": 1}, {"absoluteCount": 4, "absoluteCountFiltered": 4, "code": "GO:0000011", "numberOfPepts": 1, "value": 0.2105263157894737, "weightedValue": 0.8}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
        await expect(wkr.summarizeEc(50)).resolves.toHaveProperty("data", [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
    });

    it("with cutoff 100", async () => {
        await expect(wkr.summarizeGo(100)).resolves.toHaveProperty("data", {"biological process": [{"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000017", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000009", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000012", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
        await expect(wkr.summarizeEc(100)).resolves.toHaveProperty("data", []);
    });


    it("Limited set of peptides", async () => {
        await expect(wkr.summarizeGo(50, ["AALTER"])).resolves.toHaveProperty("data", {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "numberOfPepts": 1, "value": 0.3333333333333333, "weightedValue": 1}]});
        await expect(wkr.summarizeEc(100, ["AALTER"])).resolves.toHaveProperty("data", []);
    });
});
describe("Should fail with reject", () => {
    it("when no internet", async () => {
        fetchMock.setup({});
        await expect(wkr.process(["AALTER"], {})).rejects.toEqual("NOT FOUND /mpa/pept2data");

        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
            []);
        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
            {"biological process": [], "cellular component": [], "molecular function": []});
    });
});

const exDataAALTER = {
    "sequence": "AALTER", "lca": 541000,
    "lineage": [2, null, null, null, 1239, null, null, 186801, null, null, null, 186802, null, null, null, null, 541000, null, null, null, null, null, null, null, null, null, null, null],
    "fa": {"counts": {"EC": 2, "GO": 3, "all": 3}, "data": {"EC:1.2.3.4": 1, "EC:5.6.7.8": 1, "GO:0000001": 3, "GO:0000002": 3, "GO:0000003": 3, "GO:0000004": 3}},
};
