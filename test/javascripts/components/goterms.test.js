import GOTerms from "../../../app/assets/javascripts/components/goterms";


describe("shoud be correct with num proteins", () => {
    let goTerms;
    beforeEach(() => {
        goTerms = new GOTerms({
            data: {
                "biological process": [
                    {value: 5, name: "Awesomeinase", code: "GO:12345"},
                    {value: 2, name: "Coolnessine", code: "GO:421337"},
                ],
            },
            numAnnotatedProteins: 10,
        });
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("list namespaces", () => {
        expect(GOTerms.NAMESPACES).toEqual(["biological process", "cellular component", "molecular function"]);
    });

    it("for getTotalSetSize", () => {
        expect(goTerms.getTotalSetSize()).toBe(10);
    });

    it("for getValueOf", () => {
        expect(goTerms.getValueOf("GO:12345")).toBe(5);
        expect(goTerms.getValueOf("GO:421337")).toBe(2);
        expect(goTerms.getValueOf("GO:YOLO")).toBe(0);
    });

    it("for getFractionOf", () => {
        expect(goTerms.getFractionOf("GO:12345")).toBe(0.5);
        expect(goTerms.getFractionOf("GO:421337")).toBe(0.2);
        expect(goTerms.getFractionOf("GO:YOLO")).toBe(0);
    });

    it("for sortedTerms", () => {
        expect(goTerms.sortedTerms("biological process")).toEqual([{"code": "GO:12345", "name": "Awesomeinase", "value": 5}, {"code": "GO:421337", "name": "Coolnessine", "value": 2}]);
        expect(goTerms.sortedTerms("cellular component")).toEqual([]);
        expect(goTerms.sortedTerms("molecular function")).toEqual([]);
    });

    it("for GOChart", () => {
        expect(GOTerms.quickGOChartURL(["GO:0", "GO:1"])).toEqual("https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0,GO:1/chart");
    });


    it("get static name", () => {
        expect(GOTerms.nameOf("GO:12345")).toEqual("Awesomeinase");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");
    });


    it("get static namespace", () => {
        expect(GOTerms.namespaceOf("GO:12345")).toEqual("biological process");
        expect(GOTerms.namespaceOf("GO:YOLO")).toEqual("Unknown");
    });
});

describe("shoud be correct", () => {
    let goTerms;
    beforeEach(() => {
        goTerms = new GOTerms({
            data: {
                "biological process": [
                    {value: 5, name: "Awesomeinase", code: "GO:12345"},
                    {value: 2, name: "Coolnessine", code: "GO:421337"},
                ],
            },
        });
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("list namespaces", () => {
        expect(GOTerms.NAMESPACES).toEqual(["biological process", "cellular component", "molecular function"]);
    });

    it("for getValueOf", () => {
        expect(goTerms.getValueOf("GO:12345")).toBe(5);
        expect(goTerms.getValueOf("GO:421337")).toBe(2);
        expect(goTerms.getValueOf("GO:YOLO")).toBe(0);
    });
    it("for sortedTerms", () => {
        expect(goTerms.sortedTerms("biological process")).toEqual([{"code": "GO:12345", "name": "Awesomeinase", "value": 5}, {"code": "GO:421337", "name": "Coolnessine", "value": 2}]);
        expect(goTerms.sortedTerms("cellular component")).toEqual([]);
        expect(goTerms.sortedTerms("molecular function")).toEqual([]);
    });

    it("for GOChart", () => {
        expect(GOTerms.quickGOChartURL(["GO:0", "GO:1"])).toEqual("https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0,GO:1/chart");
    });


    it("get static name", () => {
        expect(GOTerms.nameOf("GO:12345")).toEqual("Awesomeinase");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");
    });


    it("get static namespace", () => {
        expect(GOTerms.namespaceOf("GO:12345")).toEqual("biological process");
        expect(GOTerms.namespaceOf("GO:YOLO")).toEqual("Unknown");
    });
});


describe("shoud work correctly on empty set", () => {
    let goTerms;
    beforeEach(() => {
        goTerms = new GOTerms({data: []});
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("for getValueOf", () => {
        expect(goTerms.getValueOf("GO:12345")).toBe(0);
    });
    it("for sortedTerms", () => {
        expect(goTerms.sortedTerms("biological process")).toEqual([]);
        expect(goTerms.sortedTerms("cellular component")).toEqual([]);
        expect(goTerms.sortedTerms("molecular function")).toEqual([]);
    });

    it("get static name", () => {
        expect(GOTerms.nameOf("GO:12345")).toEqual("Unknown");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");
    });

    it("get static namespace", () => {
        expect(GOTerms.namespaceOf("GO:12345")).toEqual("Unknown");
        expect(GOTerms.namespaceOf("GO:YOLO")).toEqual("Unknown");
    });
});


describe("shoud ingest data correctly on a clone on base", () => {
    it("for getValueOf", () => {
        let base = new GOTerms({
            data: {
                "biological process": [
                    {value: 42, name: "NO", code: "GO:000000"},
                    {value: 1337, name: "BAD", code: "GO:001010"},
                ],
            },
            numAnnotatedProteins: 10,
        });

        let goTerms = GOTerms.clone({
            data: {
                "biological process": [
                    {value: 5, name: "Awesomeinase", code: "GO:12345"},
                    {value: 2, name: "Coolnessine", code: "GO:421337"},
                ],
                "cellular component": [],
                "molecular function": [],
            },
            go: new Map([
                ["GO:12345", {value: 5, name: "Awesomeinase", code: "GO:12345"}],
                ["GO:421337", {value: 2, name: "Coolnessine", code: "GO:421337"}],
            ]),
        }, base);

        expect(goTerms.sortedTerms("biological process")).toEqual([{"code": "GO:12345", "name": "Awesomeinase", "value": 5}, {"code": "GO:421337", "name": "Coolnessine", "value": 2}]);
        expect(goTerms.sortedTerms("cellular component")).toEqual([]);
        expect(goTerms.sortedTerms("molecular function")).toEqual([]);
    });
});

describe("shoud ingest data correctly on a clone", () => {
    let goTerms;
    beforeEach(() => {
        goTerms = GOTerms.clone({
            data: {
                "biological process": [
                    {value: 5, name: "Awesomeinase", code: "GO:12345"},
                    {value: 2, name: "Coolnessine", code: "GO:421337"},
                ],
                "cellular component": [],
                "molecular function": [],
            },
            go: new Map([
                ["GO:12345", {value: 5, name: "Awesomeinase", code: "GO:12345"}],
                ["GO:421337", {value: 2, name: "Coolnessine", code: "GO:421337"}],
            ]),
        });
    });
    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("for getValueOf", () => {
        expect(goTerms.getValueOf("GO:12345")).toBe(5);
    });
    it("for sortedTerms", () => {
        expect(goTerms.sortedTerms("biological process")).toEqual([{"code": "GO:12345", "name": "Awesomeinase", "value": 5}, {"code": "GO:421337", "name": "Coolnessine", "value": 2}]);
        expect(goTerms.sortedTerms("cellular component")).toEqual([]);
        expect(goTerms.sortedTerms("molecular function")).toEqual([]);
    });

    it("get static name without ingest", () => {
        expect(GOTerms.nameOf("GO:12345")).toEqual("Unknown");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");
    });


    it("get static name with ingest", () => {
        expect(GOTerms.nameOf("GO:12345")).toEqual("Unknown");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");
    });

    it("get static namespace", () => {
        GOTerms.ingestData(new Map([["GO:TEST", {name: "Unipept", namespace: "molecular function", code: "GO:424242"}]]));
        expect(GOTerms.namespaceOf("GO:12345")).toEqual("Unknown");
        expect(GOTerms.namespaceOf("GO:YOLO")).toEqual("Unknown");
    });
});


describe("should fetch the correct data", () => {
    let fetchMock = require("../test_helpers/fetch_mock.js");

    let goTerms;
    beforeEach( async () => {
        fetchMock.setup({
            "/private_api/goterms": [{
                test: d => true,
                value: data => {
                    let p = JSON.parse(data.body).goterms;
                    return p.map(x => {
                        return {code: x, name: "The term " + x, namespace: "molecular function"};
                    });
                },
            }],
        });

        goTerms = new GOTerms({
            data: {
                "molecular function": [
                    {value: 5, code: "GO:987654"},
                    {value: 2, code: "GO:133742"},
                ],
            },
        }, false);
        await goTerms.ensureData();
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("for getValueOf", () => {
        expect(goTerms.getValueOf("GO:987654")).toBe(5);
        expect(goTerms.getValueOf("GO:133742")).toBe(2);
        expect(goTerms.getValueOf("GO:YOLO")).toBe(0);
    });

    it("for sortedTerms", () => {
        expect(goTerms.sortedTerms("molecular function")).toEqual([{"code": "GO:987654", "value": 5}, {"code": "GO:133742", "value": 2}]);
        expect(goTerms.sortedTerms("cellular component")).toEqual([]);
        expect(goTerms.sortedTerms("biological process")).toEqual([]);
    });

    it("get static name (and allow fetching more)", async () => {
        expect(GOTerms.nameOf("GO:987654")).toEqual("The term GO:987654");
        expect(GOTerms.nameOf("GO:12345")).toEqual("Unknown");
        await GOTerms.addMissingNames(["GO:12345"]);
        expect(GOTerms.nameOf("GO:12345")).toEqual("The term GO:12345");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");
    });
});
