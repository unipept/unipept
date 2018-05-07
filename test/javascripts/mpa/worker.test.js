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
        expect.assertions(5);

        let pepts = ["AALTER"];
        await expect(wkr.process(pepts, {})).resolves.toEqual({
            processed: [["AALTER", Object.assign({count: 1}, exDataAALTER)]],
            missed: [],
            numMatched: 1,
            numSearched: 1,
        });

        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
            {"biological process": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0042026", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005737", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0051082", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005524", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}]});
        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
            [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);


        expect(wkr.getGoData()).toEqual(new Map([["GO:0005524", {"code": "GO:0005524", "name": "ATP binding", "namespace": "molecular function"}], ["GO:0005737", {"code": "GO:0005737", "name": "cytoplasm", "namespace": "cellular component"}], ["GO:0042026", {"code": "GO:0042026", "name": "protein refolding", "namespace": "biological process"}], ["GO:0051082", {"code": "GO:0051082", "name": "unfolded protein binding", "namespace": "molecular function"}]]));
        expect(wkr.getEcNames()).toEqual(new Map([["-.-.-.-", "Enzyme Commission Numbers"], ["1.2.3.4", "A function"]]));
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

        await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
            [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
        await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
            {"biological process": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0042026", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005737", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0051082", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005524", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}]});
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

            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
                [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
                {"biological process": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0042026", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005737", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0051082", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005524", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}]});
        });

        it("false", async () => {
            let pepts = ["AALTER", "AALTER", "AALTER", "AALTER"];
            await expect(wkr.process(pepts, {dupes: false})).resolves.toEqual({
                processed: [["AALTER", Object.assign({count: 4}, exDataAALTER)]],
                missed: [],
                numMatched: 4,
                numSearched: 4,
            });

            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
                [{"absoluteCount": 4, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 4, "value": 0.5, "weightedValue": 2}, {"absoluteCount": 4, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 4, "value": 0.5, "weightedValue": 2}]);
            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
                {"biological process": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0042026", "numberOfPepts": 4, "value": 1, "weightedValue": 4}], "cellular component": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0005737", "numberOfPepts": 4, "value": 1, "weightedValue": 4}], "molecular function": [{"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0051082", "numberOfPepts": 4, "value": 0.5, "weightedValue": 4}, {"absoluteCount": 12, "absoluteCountFiltered": 3, "code": "GO:0005524", "numberOfPepts": 4, "value": 0.5, "weightedValue": 4}]});
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


            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
                [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
                {"biological process": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0042026", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005737", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0051082", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005524", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}]});
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

            await expect(wkr.summarizeEc()).resolves.toHaveProperty("data",
                [{"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "1.2.3.4", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}, {"absoluteCount": 1, "absoluteCountFiltered": 1, "code": "5.6.7.8", "numberOfPepts": 1, "value": 0.5, "weightedValue": 0.5}]);
            await expect(wkr.summarizeGo()).resolves.toHaveProperty("data",
                {"biological process": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0042026", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "cellular component": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005737", "numberOfPepts": 1, "value": 1, "weightedValue": 1}], "molecular function": [{"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0051082", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}, {"absoluteCount": 3, "absoluteCountFiltered": 3, "code": "GO:0005524", "numberOfPepts": 1, "value": 0.5, "weightedValue": 1}]});
        });
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
    "fa": {
        "counts": {"all": 3, "EC": 2, "GO": 3},
        "data": {
            "GO:0042026": 3, "GO:0051082": 3, "GO:0005737": 3, "GO:0005524": 3,
            "EC:1.2.3.4": 1, "EC:5.6.7.8": 1,
        },
    },
};
