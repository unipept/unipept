let wkr = require("mpa/worker.js");


let old = self.postMessage;
self.postMessage = function (...args) {
    if (args.length === 1) return;
    old(...args);
};

beforeEach(function () {
    global.fetch = jest.fn().mockImplementation((url, data) => {
        let a = {
            "/mpa/pept2data": [
                {
                    test: data.method === "POST" && "body" in data,
                    value: () => {
                        if (JSON.parse(data.body).peptides.includes("AALTER")) {
                            return {peptides: [exDataAALTER]};
                        } else {
                            return [];
                        }
                    },
                },
            ],
        };


        let p = new Promise((resolve, reject) => {
            if (url in a) {
                let thedata;
                let found = false;
                for (let d of a[url]) {
                    if (d.test) {
                        thedata = d.value();
                        found = true;
                        break;
                    }
                }

                if (found) {
                    resolve({
                        ok: true,
                        Id: "123",
                        json: function () {
                            return thedata;
                        },
                    });
                }
                reject("NOT FOUND, due params");
            } else {
                reject("NOT FOUND");
            }
        });

        return p;
    });
});

it("should have an GO and EC data should be empty", () => {
    expect(wkr.getGoData()).toEqual(new Map());
    expect(wkr.getEcNames()).toEqual(new Map([["-.-.-.-", "Enzyme Commission Numbers"]]));
});

it("should get correct results", async () => {
    expect.assertions(2);

    let pepts = ["AALTER", "AAAAA"];
    let result = await wkr.process(pepts, {});

    expect(result).toEqual({
        processed: [["AALTER", exDataAALTER]],
        missed: ["AAAAA"],
        numMatched: 1,
        numSearched: 2,
    });
    expect(global.fetch.mock.calls).toHaveLength(1);
});


const exDataAALTER = {
    "sequence": "AALTER", "lca": 541000,
    "lineage": [2, null, null, null, 1239, null, null, 186801, null, null, null, 186802, null, null, null, null, 541000, null, null, null, null, null, null, null, null, null, null, null],
    "fa": {
        "counts": {"all": 3, "EC": 0, "GO": 3},
        "data": {"GO:0042026": 3, "GO:0051082": 3, "GO:0005737": 3, "GO:0005524": 3},
    },
}
;
