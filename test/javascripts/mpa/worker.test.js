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

it("should have no GO data", () => {
    expect(wkr.getGoData()).toEqual([]);
});

describe("Should be correct (default config)", () => {
    it("for AALTER", async () => {
        expect.assertions(3);

        let pepts = ["AALTER"];
        await expect(wkr.process(pepts, {})).resolves.toMatchObject({
            processed: [Object.assign({count: 1}, exDataAALTER)],
            missed: [],
            numMatched: 1,
            numSearched: 1,
        });

        await expect(wkr.summarizeGo()).resolves.toEqual({"data": {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "cellular component": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}}});
        await expect(wkr.summarizeEc()).resolves.toEqual({"data": [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}], "trust": {"annotatedCount": 1, "totalCount": 1, "trustCount": 0.6666666666666666}});
    });

    it("for NOFADATA (no FA data availible)", async () => {
        let pepts = ["NOFADATA"];
        await expect(wkr.process(pepts, {})).resolves.toMatchObject({
            "missed": [],
            "numMatched": 1,
            "numSearched": 1,
            "processed": [{"count": 1, "lca": 541000, "lineage": [2, null, null, null, 1239, null, null, 186801, null, null, null, 186802, null, null, null, null, 541000, null, null, null, null, null, null, null, null, null, null, null], "sequence": "NOFADATA"}],
        });
        let r = await wkr.summarizeGo();
        await expect(r).toEqual({"data": {"biological process": [], "cellular component": [], "molecular function": []}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "cellular component": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "molecular function": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}}});
        await expect(wkr.summarizeEc()).resolves.toEqual({"data": [], "trust": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}});
    });


    it("if there are no matches", async () => {
        expect.assertions(3);

        let pepts = ["MISSES"];
        await expect(wkr.process(pepts, {})).resolves.toMatchObject({
            processed: [],
            missed: ["MISSES"],
            numMatched: 0,
            numSearched: 1,
        });

        await expect(wkr.summarizeEc()).resolves.toEqual( {"data": [], "trust": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}});
        await expect(wkr.summarizeGo()).resolves.toEqual({"data": {"biological process": [], "cellular component": [], "molecular function": []}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}, "cellular component": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}, "molecular function": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}}});
    });

    it("for shorter than 5 (empty result)", async () => {
        expect.assertions(3);

        let pepts = ["AALT", "GPL"];
        await expect(wkr.process(pepts, {})).resolves.toMatchObject({
            processed: [],
            missed: [],
            numMatched: 0,
            numSearched: 0,
        });

        await expect(wkr.summarizeEc()).resolves.toEqual( {"data": [], "trust": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}});
        await expect(wkr.summarizeGo()).resolves.toEqual({"data": {"biological process": [], "cellular component": [], "molecular function": []}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}, "cellular component": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}, "molecular function": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}}});
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
        await expect(wkr.process(pepts, {il: true})).resolves.toMatchObject({
            processed: [Object.assign({count: 1}, exDataAALTER)],
            missed: [],
            numMatched: 1,
            numSearched: 1,
        });


        await expect(wkr.summarizeGo()).resolves.toEqual( {"data": {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "cellular component": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}}});
        await expect(wkr.summarizeEc()).resolves.toEqual( {"data": [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}], "trust": {"annotatedCount": 1, "totalCount": 1, "trustCount": 0.6666666666666666}});
    });

    describe("for duplicates", () => {
        it("true", async () => {
            let pepts = ["AALTER", "AALTER", "AALTER", "AALTER"];
            await expect(wkr.process(pepts, {dupes: true})).resolves.toMatchObject({
                processed: [Object.assign({count: 1}, exDataAALTER)],
                missed: [],
                numMatched: 1,
                numSearched: 1,
            });

            await expect(wkr.summarizeGo()).resolves.toEqual( {"data": {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "cellular component": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}}});
            await expect(wkr.summarizeEc()).resolves.toEqual( {"data": [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}], "trust": {"annotatedCount": 1, "totalCount": 1, "trustCount": 0.6666666666666666}});
        });

        it("false", async () => {
            let pepts = ["AALTER", "AALTER", "AALTER", "AALTER"];
            await expect(wkr.process(pepts, {dupes: false})).resolves.toMatchObject({
                processed: [Object.assign({count: 4}, exDataAALTER)],
                missed: [],
                numMatched: 4,
                numSearched: 4,
            });


            await expect(wkr.summarizeGo()).resolves.toEqual( {"data": {"biological process": [], "cellular component": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 1, "numberOfPepts": 4, "sequences": {"AALTER": 4}, "trust": 1, "value": 4, "weightedValue": 4}], "molecular function": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 4, "sequences": {"AALTER": 4}, "trust": 1, "value": 4, "weightedValue": 4}, {"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 4, "sequences": {"AALTER": 4}, "trust": 1, "value": 4, "weightedValue": 4}, {"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 4, "sequences": {"AALTER": 4}, "trust": 1, "value": 4, "weightedValue": 4}]}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 4, "trustCount": 0}, "cellular component": {"annotatedCount": 4, "totalCount": 4, "trustCount": 4}, "molecular function": {"annotatedCount": 4, "totalCount": 4, "trustCount": 4}}});
            await expect(wkr.summarizeEc()).resolves.toEqual( {"data": [{"absoluteCount": 4, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 4, "sequences": {"AALTER": 4}, "trust": 0.6666666666666666, "value": 4, "weightedValue": 2}, {"absoluteCount": 4, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 4, "sequences": {"AALTER": 4}, "trust": 0.6666666666666666, "value": 4, "weightedValue": 2}], "trust": {"annotatedCount": 4, "totalCount": 4, "trustCount": 2.6666666666666665}});
        });
    });

    describe("for advanced missed cleavage handeling", () => {
        const goRes = {"data": {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "cellular component": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}}};
        const ecRes = {"data": [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}], "trust": {"annotatedCount": 1, "totalCount": 1, "trustCount": 0.6666666666666666}};
        const peptidesRes = {
            processed: [Object.assign({count: 1}, exDataAALTER)],
            missed: [],
            numMatched: 1,
            numSearched: 1,
        };
        it("true", async () => {
            let pepts = ["AALTER"];
            await expect(wkr.process(pepts, {missed: true})).resolves.toMatchObject(peptidesRes);

            await expect(JSON.parse(fetchMock.getMock().calls[0][1].body)).toHaveProperty("missed", true);


            await expect(wkr.summarizeGo()).resolves.toEqual(goRes);
            await expect(wkr.summarizeEc()).resolves.toEqual(ecRes);
        });

        it("false", async () => {
            let pepts = ["AALTER"];
            await expect(wkr.process(pepts, {missed: false})).resolves.toMatchObject(peptidesRes);

            await expect(JSON.parse(fetchMock.getMock().calls[0][1].body)).toHaveProperty("missed", false);


            await expect(wkr.summarizeGo()).resolves.toEqual(goRes);
            await expect(wkr.summarizeEc()).resolves.toEqual(ecRes);
        });
    });
});


describe("Should get correct FAs", () => {
    beforeEach(async () => {
        await wkr.process(["AALTER", "AAYLFNALPTK"], {});
    });
    it("with cutoff 0", async () => {
        await expect(wkr.summarizeGo(0)).resolves.toEqual({"data": {"biological process": [{"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000017", "evidence": 0.2631578947368421, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000009", "evidence": 0.2631578947368421, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 4, "absoluteCountFiltered": 4, "code": "GO:0000011", "evidence": 0.2105263157894737, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 0.8}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000012", "evidence": 0.2631578947368421, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3125, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 4, "absoluteCountFiltered": 4, "code": "GO:0000002", "evidence": 0.37499999999999994, "fractionOfPepts": 1, "numberOfPepts": 2, "sequences": {"AALTER": 1, "AAYLFNALPTK": 1}, "trust": 1, "value": 2, "weightedValue": 1.2}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3125, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}, "cellular component": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}, "molecular function": {"annotatedCount": 2, "totalCount": 2, "trustCount": 2}}});
        await expect(wkr.summarizeEc(0)).resolves.toEqual({"data": [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}], "trust": {"annotatedCount": 1, "totalCount": 2, "trustCount": 0.6666666666666666}});
    });

    it("with cutoff 50", async () => {
        await expect(wkr.summarizeGo(50)).resolves.toEqual({"data": {"biological process": [{"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000017", "evidence": 0.2631578947368421, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000009", "evidence": 0.2631578947368421, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 4, "absoluteCountFiltered": 4, "code": "GO:0000011", "evidence": 0.2105263157894737, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 0.8}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000012", "evidence": 0.2631578947368421, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}, "cellular component": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}}});
        await expect(wkr.summarizeEc(50)).resolves.toEqual({"data": [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "evidence": 0.5, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "evidence": 0.5, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 0.6666666666666666, "value": 1, "weightedValue": 0.5}], "trust": {"annotatedCount": 1, "totalCount": 2, "trustCount": 0.6666666666666666}});
    });

    it("with cutoff 100", async () => {
        await expect(wkr.summarizeGo(100)).resolves.toEqual({"data": {"biological process": [{"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000017", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000009", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 5, "absoluteCountFiltered": 5, "code": "GO:0000012", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AAYLFNALPTK": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 0.5, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}, "cellular component": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 2, "trustCount": 1}}});
        await expect(wkr.summarizeEc(100)).resolves.toEqual({"data": [], "trust": {"annotatedCount": 0, "totalCount": 2, "trustCount": 0}});
    });


    it("Limited set of peptides", async () => {
        await expect(wkr.summarizeGo(50, ["AALTER"])).resolves.toEqual( {"data": {"biological process": [], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000004", "evidence": 1, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000001", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000002", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0000003", "evidence": 0.3333333333333333, "fractionOfPepts": 1, "numberOfPepts": 1, "sequences": {"AALTER": 1}, "trust": 1, "value": 1, "weightedValue": 1}]}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}, "cellular component": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}, "molecular function": {"annotatedCount": 1, "totalCount": 1, "trustCount": 1}}});
        await expect(wkr.summarizeEc(100, ["AALTER"])).resolves.toEqual({"data": [], "trust": {"annotatedCount": 0, "totalCount": 1, "trustCount": 0}});
    });
});
describe("Should fail with reject", () => {
    it("when no internet", async () => {
        fetchMock.setup({});
        await expect(wkr.process(["AALTER"], {})).rejects.toEqual("NOT FOUND /mpa/pept2data");

        await expect(wkr.summarizeEc()).resolves.toEqual({"data": [], "trust": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}});
        await expect(wkr.summarizeGo()).resolves.toEqual({"data": {"biological process": [], "cellular component": [], "molecular function": []}, "trust": {"biological process": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}, "cellular component": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}, "molecular function": {"annotatedCount": 0, "totalCount": 0, "trustCount": 0}}});
    });
});

const exDataAALTER = {
    "sequence": "AALTER", "lca": 541000,
    "lineage": [2, null, null, null, 1239, null, null, 186801, null, null, null, 186802, null, null, null, null, 541000, null, null, null, null, null, null, null, null, null, null, null],
};
