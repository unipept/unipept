import ECNumbers from "../../../app/assets/javascripts/components/ecnumbers";
afterEach(() => {
    // reset static data
    ECNumbers.ecData = new Map([["-.-.-.-", "Enzyme Commission Numbers"]]);
});

let fetchMock = require("../test_helpers/fetch_mock.js");

beforeEach( async () => {
    fetchMock.setup({
        "/private_api/ecnumbers": [{
            test: d => true,
            value: data => {
                let p = JSON.parse(data.body).ecnumbers;
                return p.map(x => {
                    return {code: x, name: "The number " + x};
                });
            },
        }],
    });
});

describe("shoud be correct with num", () => {
    let enNums;
    beforeEach(() => {
        enNums = ECNumbers.make({
            data: [
                {value: 5, name: "Awesomeinase", code: "1.4.9.6"},
                {value: 2, name: "Coolnessine", code: "1.3.3.7"},
            ],
            numAnnotatedProteins: 10,
        });
    });

    it("for valueOf", () => {
        expect(enNums.valueOf("1.4.9.6")).toBe(5);
        expect(enNums.valueOf("1.3.3.7")).toBe(2);
        expect(enNums.valueOf("9.8.7.6")).toBe(0);
    });


    it("for sortedTerms", () => {
        expect([...enNums]).toEqual([{"code": "1.4.9.6", "name": "Awesomeinase", "value": 5}, {"code": "1.3.3.7", "name": "Coolnessine", "value": 2}]);
    });

    it("get static name", () => {
        expect(ECNumbers.nameOf("1.4.9.6")).toEqual("Awesomeinase");
        expect(ECNumbers.nameOf("9.8.7.6")).toEqual("Unknown");
    });
});

describe("shoud be correct", () => {
    let enNums;
    beforeEach(() => {
        enNums = ECNumbers.make({
            data: [
                {value: 2, name: "Coolnessine", code: "1.3.3.7"},
                {value: 5, name: "Awesomeinase", code: "1.4.9.6"},
            ],
        });
    });

    it("for valueOf", () => {
        expect(enNums.valueOf("1.4.9.6")).toBe(5);
        expect(enNums.valueOf("1.3.3.7")).toBe(2);
        expect(enNums.valueOf("9.8.7.6")).toBe(0);
    });
    it("for sortedTerms", () => {
        expect(enNums.getSortedBy((a, b) => b.value - a.value)).toEqual([{"code": "1.4.9.6", "name": "Awesomeinase", "value": 5}, {"code": "1.3.3.7", "name": "Coolnessine", "value": 2}]);
    });

    it("get static name", () => {
        expect(ECNumbers.nameOf("1.4.9.6")).toEqual("Awesomeinase");
        expect(ECNumbers.nameOf("9.8.7.6")).toEqual("Unknown");
    });
});

describe("shoud work correctly on empty set", () => {
    let enNums;
    beforeEach(() => {
        enNums = ECNumbers.make({data: []});
    });

    it("for valueOf", () => {
        expect(enNums.valueOf("1.4.9.6")).toBe(0);
    });
    it("for sortedTerms", () => {
        expect([...enNums]).toEqual([]);
    });

    it("get static name", () => {
        expect(ECNumbers.nameOf("1.4.9.6")).toEqual("Unknown");
        expect(ECNumbers.nameOf("9.8.7.6")).toEqual("Unknown");
    });
});


describe("should fetch the correct data", () => {
    let enNums;
    beforeEach( async () => {
        enNums = await ECNumbers.makeAssured({
            data: [
                {value: 5, code: "1.3.4.3"},
                {value: 2, code: "1.3.4.17"},
                {code: "1.2.-.-"},
            ],
        }, false);
    });

    it("for valueOf", () => {
        expect(enNums.valueOf("1.3.4.3")).toBe(5);
        expect(enNums.valueOf("1.3.4.17")).toBe(2);
        expect(enNums.valueOf("1.3.-.-")).toBe(0);
        expect(enNums.valueOf("1.2.-.-")).toBe(0);
        expect(enNums.valueOf("9.8.7.6")).toBe(0);
    });

    it("for sortedTerms", () => {
        expect(enNums.getSortedBy((a, b) => b.value - a.value)).toEqual([{"code": "1.3.4.3", "value": 5}, {"code": "1.3.4.17", "value": 2}, {code: "1.2.-.-"}]);
    });

    it("get static name (and allow fetching more)", async () => {
        expect(ECNumbers.nameOf("1.3.4.3")).toEqual("The number 1.3.4.3");
        expect(ECNumbers.nameOf("1.4.9.6")).toEqual("Unknown");
        expect(ECNumbers.nameOf("1.4.-.-")).toEqual("Unknown");
        expect(ECNumbers.nameOf("1.3.-.-")).toEqual("The number 1.3.-.-");

        await ECNumbers.fetch("1.4.9.6");
        expect(ECNumbers.nameOf("1.4.9.6")).toEqual("The number 1.4.9.6");
        expect(ECNumbers.nameOf("9.8.7.6")).toEqual("Unknown");
        expect(ECNumbers.nameOf("1.4.-.-")).toEqual("The number 1.4.-.-"); // fetched because 1.4.9.6 was fetched


        const oldCount = fetchMock.getMock().calls.length;
        await ECNumbers.fetch("1.4.9.6");
        expect(fetchMock.getMock().calls).toHaveLength(oldCount);
    });
});


describe("treedata", () => {
    it("correct0", async () => {
        let ecNums = await ECNumbers.makeAssured({
            data: [],
        }, false);
        expect(ecNums.treeData()).toMatchObject({"name": "-.-.-.-", "children": [], "data": {"self_count": 0, "count": 0}});
    });

    it("correct1", async () => {
        let ecNums = await ECNumbers.makeAssured({
            data: [
                {value: 5, code: "1.3.4.3"},
                {value: 2, code: "1.3.4.17"},
            ],
        }, false);
        expect(ecNums.treeData()).toMatchObject({"name": "-.-.-.-", "children": [
            {"name": "1", "children": [
                {"name": "1.3", "children": [
                    {"name": "1.3.4", "children": [
                        {"name": "1.3.4.3", "children": [], "data": {"self_count": 5, "count": 5, "data": {"value": 5, "code": "1.3.4.3"}}},
                        {"name": "1.3.4.17", "children": [], "data": {"self_count": 2, "count": 2, "data": {"value": 2, "code": "1.3.4.17"}}},
                    ], "data": {"self_count": 0, "count": 7, "data": {"code": "1.3.4.-", "value": 0}}},
                ], "data": {"self_count": 0, "count": 7, "data": {"code": "1.3.-.-", "value": 0}}},
            ], "data": {"self_count": 0, "count": 7, "data": {"code": "1.-.-.-", "value": 0}}},
        ], "data": {"self_count": 0, "count": 7}});
    });


    it("correct3", async () => {
        let ecNums = await ECNumbers.makeAssured({
            data: [
                {value: 5, code: "1.3.4.3"},
                {value: 2, code: "1.3.4.17"},
                {value: 1, code: "1.3.-.-"},
            ],
        }, false);
        expect(ecNums.treeData()).toMatchObject({"name": "-.-.-.-", "children": [
            {"name": "1", "children": [
                {"name": "1.3", "children": [
                    {"name": "1.3.4", "children": [
                        {"name": "1.3.4.3", "children": [], "data": {"self_count": 5, "count": 5, "data": {"value": 5, "code": "1.3.4.3"}}},
                        {"name": "1.3.4.17", "children": [], "data": {"self_count": 2, "count": 2, "data": {"value": 2, "code": "1.3.4.17"}}},
                    ], "data": {"self_count": 0, "count": 7, "data": {"code": "1.3.4.-", "value": 0}}},
                ], "data": {"self_count": 1, "count": 8, "data": {"code": "1.3.-.-", "value": 1}}},
            ], "data": {"self_count": 0, "count": 8, "data": {"code": "1.-.-.-", "value": 0}}},
        ], "data": {"self_count": 0, "count": 8}});
    });
});

describe("statics should work", () => {
    it("ancestorsOf", () => {
        expect(ECNumbers.ancestorsOf("2.9.8.3")).toEqual(["2.9.8.-", "2.9.-.-", "2.-.-.-"]);
        expect(ECNumbers.ancestorsOf("2.9.8.-")).toEqual(["2.9.-.-", "2.-.-.-"]);
        expect(ECNumbers.ancestorsOf("2.9.-.-")).toEqual(["2.-.-.-"]);
        expect(ECNumbers.ancestorsOf("2.-.-.-")).toEqual([]);
        expect(ECNumbers.ancestorsOf("-.-.-.-")).toEqual([]);

        expect(ECNumbers.ancestorsOf("2.9.8.3", true)).toEqual(["2.9.8.-", "2.9.-.-", "2.-.-.-", "-.-.-.-"]);
        expect(ECNumbers.ancestorsOf("2.9.8.-", true)).toEqual(["2.9.-.-", "2.-.-.-", "-.-.-.-"]);
        expect(ECNumbers.ancestorsOf("2.9.-.-", true)).toEqual(["2.-.-.-", "-.-.-.-"]);
        expect(ECNumbers.ancestorsOf("2.-.-.-", true)).toEqual(["-.-.-.-"]);
        expect(ECNumbers.ancestorsOf("-.-.-.-", true)).toEqual(["-.-.-.-"]);
    });

    it("levelOf", () => {
        expect(ECNumbers.levelOf("2.9.8.3")).toEqual(4);
        expect(ECNumbers.levelOf("2.9.8.-")).toEqual(3);
        expect(ECNumbers.levelOf("2.9.-.-")).toEqual(2);
        expect(ECNumbers.levelOf("2.-.-.-")).toEqual(1);
        expect(ECNumbers.levelOf("-.-.-.-")).toEqual(0);
        expect(ECNumbers.levelOf("2.9.8.-")).toEqual(3);
    });
})
;
