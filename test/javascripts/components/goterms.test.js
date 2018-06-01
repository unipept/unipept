import GOTerms from "../../../app/assets/javascripts/components/goterms";


describe("shoud be correct with num proteins", () => {
    let goTerms;
    beforeEach(() => {
        goTerms = GOTerms.make({
            data: {
                "biological process": [
                    {value: 5, name: "Awesomeinase", code: "GO:12345"},
                    {value: 2, name: "Coolnessine", code: "GO:421337"},
                ],
                "cellular component": [
                    {value: 9, name: "Lol", code: "GO:000000"},
                ],
            },
            numAnnotatedProteins: 10,
        });
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    describe("instance methods", () => {
        it("for valueOf", () => {
            expect(goTerms.valueOf("GO:12345")).toBe(5);
            expect(goTerms.valueOf("GO:421337")).toBe(2);
            expect(goTerms.valueOf("GO:YOLO")).toBe(0);
        });

        it("for groupNameOf", () => {
            expect(goTerms.groupNameOf("GO:12345")).toBe("biological process");
            expect(goTerms.groupNameOf("GO:421337")).toBe("biological process");
            expect(goTerms.groupNameOf("GO:YOLO")).toBe(null);
        });

        it("is itteratable", () => {
            const array = [...goTerms];
            expect(array).toHaveLength(3);
            expect(array).toEqual(expect.arrayContaining([
                {"code": "GO:12345", "name": "Awesomeinase", "value": 5},
                {"code": "GO:000000", "name": "Lol", "value": 9},
                {"code": "GO:421337", "name": "Coolnessine", "value": 2}]));
        });
    });


    describe("static methods", () => {
        it("for namespaceOf", () => {
            expect(GOTerms.namespaceOf("GO:12345")).toBe("biological process");
            expect(GOTerms.namespaceOf("GO:421337")).toBe("biological process");
            expect(GOTerms.namespaceOf("GO:YOLO", null)).toBe(null);
            expect(GOTerms.namespaceOf("GO:YOLO", 0)).toBe(0);
            expect(GOTerms.namespaceOf("GO:YOLO")).toBe("Unknown");
        });

        it("for nameOf", () => {
            expect(GOTerms.nameOf("GO:12345")).toBe("Awesomeinase");
            expect(GOTerms.nameOf("GO:421337")).toBe("Coolnessine");
            expect(GOTerms.nameOf("GO:YOLO", null)).toBe(null);
            expect(GOTerms.nameOf("GO:YOLO", 0)).toBe(0);
            expect(GOTerms.nameOf("GO:YOLO")).toBe("Unknown");
        });
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

        goTerms = await new GOTerms.makeAssured({
            data: {
                "molecular function": [
                    {value: 5, code: "GO:987654"},
                    {value: 2, code: "GO:133742"},
                ],
            },
        });
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("for getValueOf", () => {
        expect(goTerms.valueOf("GO:987654")).toBe(5);
        expect(goTerms.valueOf("GO:133742")).toBe(2);
        expect(goTerms.valueOf("GO:YOLO")).toBe(0);
    });

    it("for sortedTerms", () => {
        expect(goTerms.getSortedBy(c => -c.value)).toEqual([{"code": "GO:987654", "value": 5}, {"code": "GO:133742", "value": 2}]);
    });

    it("get static name (and allow fetching more)", async () => {
        expect(GOTerms.nameOf("GO:987654")).toEqual("The term GO:987654");
        expect(GOTerms.nameOf("GO:12345")).toEqual("Unknown");
        await GOTerms.fetch("GO:12345");
        expect(GOTerms.nameOf("GO:12345")).toEqual("The term GO:12345");
        expect(GOTerms.nameOf("GO:YOLO")).toEqual("Unknown");

        // Check that there are no extra fetches for already looked up data
        const oldCount = fetchMock.getMock().calls.length;
        await GOTerms.fetch("GO:12345");
        expect(fetchMock.getMock().calls).toHaveLength(oldCount);
    });
});


describe("shoud work correctly on empty set", () => {
    let goTerms;
    beforeEach(() => {
        goTerms = GOTerms.make({data: []}, null);
    });

    afterEach(() => {
        // reset static data
        GOTerms.goData = new Map();
    });

    it("for getValueOf", () => {
        expect(goTerms.valueOf("GO:12345")).toBe(0);
    });
    it("for sortedTerms", () => {
        expect(goTerms.getSortedBy(c => c.value)).toEqual([]);
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


it("for GOChart", () => {
    expect(GOTerms.quickGOChartURL(["GO:0", "GO:1"])).toEqual("https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/GO:0,GO:1/chart");
});


it("list namespaces", () => {
    expect(GOTerms.NAMESPACES).toEqual(["biological process", "cellular component", "molecular function"]);
});
