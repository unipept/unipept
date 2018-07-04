const base = "http://localhost:5000";
// const base = "http://morty.ugent.be";


let page;
const goToPage = pepts => {
    return async () => {
        page = await global.__BROWSER__.newPage(); // eslint-disable-line no-undef
        await page.goto(base + "/datasets");
        const navigationPromise = page.waitForNavigation({"waitUntil": "networkidle0"});
        await page.evaluate(pepts => {
            $("#qs").val(pepts.join("\n"));
            $("#search-multi-form").click();
        }, pepts);
        await navigationPromise; await page.waitForFunction(() => document.getElementById("progress-fa-analysis").style.visibility === "hidden");
    };
};


describe("/mpa (simple)",
    () => {
        const pepts = ["FATSDLNDLYR", "LGIQAFEPVLIEGK", "AGFAGDDAPR", "DLTDYLMK"];
        beforeAll(goToPage(pepts));

        afterAll(async () => {
            await page.close();
        });

        it(`should have matched all ${pepts.length} peptides`, async () => {
            await expect(page.$eval("#search-intro", el => el.textContent))
                .resolves
                .toBe(`We managed to match ${pepts.length} of your ${pepts.length} peptides.`);
        });

        const textTest = name => {
            return async () => {
                const textContent = await page.$eval(name, el => el.textContent);
                expect(textContent).toContain("Organism");
            };
        };
        it("should have a sunburst", textTest("#mpa-sunburst"));
        it("should have a treemap", textTest("#mpa-treemap"));
        it("should have a treeview", textTest("#mpa-treeview"));
        it("should have a searchtree", textTest("#searchtree"));

        it("should allow downloading GO term data summary", async () => {
            const downloadPromise = checkDownload(page);
            await page.click("#goPanel button.amounttable-download");
            const downloaded = await downloadPromise;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=GO_terms-biological_process-export.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows.length).toBeGreaterThanOrEqual(1 /* header*/ + 1 /* results*/ + 1 /* newline*/);
            expect(downloadedRows[0]).toBe("Evidence (%),GO term,Name");
            expect(downloadedRows[1]).toContain("transcription, DNA-templated");
            expect(downloadedRows[1]).toContain("GO:0006351");
        });

        it("should allow downloading EC numbers data summary", async () => {
            await page.click("#fa-tabs a[href=\"#ecWrapper\"]");
            const downloadPromise = checkDownload(page);
            await page.click("#ecTable button.amounttable-download");
            const downloaded = await downloadPromise;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=EC_numbers-export.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows.length).toBeGreaterThanOrEqual(1 /* header*/ + 2 /* results*/ + 1 /* newline*/);
            expect(downloadedRows[0]).toBe("Evidence (%),EC number,Name");
            expect(downloadedRows[1]).toContain("DNA-directed RNA polymerase");
            expect(downloadedRows[1]).toContain("2.7.7.6");
        });


        it("should allow downloadig the summary CSV", async () => {
            expect.assertions(5);
            const downloadPromise = checkDownload(page);
            await page.click("#mpa-download-results");
            const downloaded = await downloadPromise;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=mpa_result.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows).toHaveLength(1 /* header*/ + 4 /* results*/ + 1 /* newline*/);
            expect(downloadedRows[0]).toBe("peptide,lca,superkingdom,kingdom,subkingdom,superphylum,phylum,subphylum,superclass,class,subclass,infraclass,superorder,order,suborder,infraorder,parvorder,superfamily,family,subfamily,tribe,subtribe,genus,subgenus,species group,species subgroup,species,subspecies,varietas,forma,EC,GO (biological process),GO (cellular component),GO (molecular function)");
        });
    });


describe("/mpa (gut7)",
    () => {
        const pepts = require("./humangut.json");
        beforeAll(goToPage(pepts), 60 * 1000);

        afterAll(async () => {
            await page.close();
        });

        it("should have matched all some peptides", async () => {
            let count = await page.$eval("#search-intro", el => el.textContent.match(/([0-9]+) of your ([0-9]+) p/));
            expect(count).not.toBeNull();
            expect(count).toHaveLength(3);
            expect(+count[1]).toBeGreaterThanOrEqual(1000);
            expect(+count[2]).toBeGreaterThanOrEqual(1000);
        });

        const textTest = name => {
            return async () => {
                const textContent = await page.$eval(name, el => el.textContent);
                expect(textContent).toContain("Organism");
                expect(textContent).toContain("Metazoa");
            };
        };

        it("should have a sunburst", textTest("#mpa-sunburst"));
        it("should have a treemap", textTest("#mpa-treemap"));
        it("should have a treeview", textTest("#mpa-treeview"));
        it("should have a searchtree", textTest("#searchtree"));

        it("should allow downloading GO term data summary", async () => {
            const downloadPromise = checkDownload(page);
            await page.click("#goPanel button.amounttable-download");
            const downloaded = await downloadPromise;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=GO_terms-biological_process-export.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows.length).toBeGreaterThanOrEqual(5);
            expect(downloadedRows[0]).toBe("Evidence (%),GO term,Name");
            expect(downloaded.data).toContain("transcription, DNA-templated");
            expect(downloaded.data).toContain("GO:0006351");
        });

        it("should allow downloading EC numbers data summary", async () => {
            await page.click("#fa-tabs a[href=\"#ecWrapper\"]");
            const downloadPromise = checkDownload(page);
            await page.click("#ecTable button.amounttable-download");
            const downloaded = await downloadPromise;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=EC_numbers-export.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows[0]).toBe("Evidence (%),EC number,Name");
            expect(downloadedRows.length).toBeGreaterThanOrEqual(5);
            expect(downloadedRows[1]).toContain("DNA-directed RNA polymerase");
            expect(downloadedRows[1]).toContain("2.7.7.6");
        });


        it("should allow downloadig the summary CSV", async () => {
            expect.assertions(6);
            const downloadPromise = checkDownload(page);
            await page.click("#mpa-download-results");
            const downloaded = await downloadPromise;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=mpa_result.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows.length).toBeGreaterThanOrEqual(1000);
            expect(downloadedRows[0]).toBe("peptide,lca,superkingdom,kingdom,subkingdom,superphylum,phylum,subphylum,superclass,class,subclass,infraclass,superorder,order,suborder,infraorder,parvorder,superfamily,family,subfamily,tribe,subtribe,genus,subgenus,species group,species subgroup,species,subspecies,varietas,forma,EC,GO (biological process),GO (cellular component),GO (molecular function)");
            expect(downloaded.data).toContain("Homo sapiens");
        });


        /**
         * Find bacteria in sunburst, click on it, see if the other views changed
         */
        it("should change on click", async () => {
            await page.evaluate(() => {
                Array.from(document.querySelectorAll("#mpa-sunburst svg text"))
                    .filter(x => x.textContent == "Bacteria")[0]
                    .classList.add("pupeteerClickTarget");
            });
            const w = page.waitForFunction(() => document.getElementById("progress-fa-analysis").style.visibility !== "hidden");
            await page.click(".pupeteerClickTarget");
            await w;
            await page.waitForFunction(() => document.getElementById("progress-fa-analysis").style.visibility === "hidden");
            await expect(page.$eval(".mpa-scope", el => el.textContent)).resolves.toBe("Bacteria");
            await expect(page.$eval("#tree_search", el => el.value)).resolves.toBe("Bacteria");
        }, 10000);
    });
