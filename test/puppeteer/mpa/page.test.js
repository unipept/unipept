

describe("/mpa",
    () => {
        let page;
        beforeAll(async () => {
            page = await global.__BROWSER__.newPage(); // eslint-disable-line no-undef
            await page.goto(`http://localhost:5000/mpa?qs=${["FATSDLNDLYR", "LGIQAFEPVLIEGK", "AGFAGDDAPR%0ADLTDYLMK"].join("%0A")}`, {"waitUntil": "networkidle0"});
            await page.waitForFunction("document.getElementById(\"progress-fa-analysis\").style.visibility === \"hidden\"");
        });

        afterAll(async () => {
            await page.close();
        });

        it("should have matched all 4 peptides", async () => {
            await expect(page.$eval("#search-intro", el => el.textContent))
                .resolves
                .toBe("We managed to match 4 of your 4 peptides.");
        });

        it("should allow downloading GO-term data", async () => {
            expect.assertions(5);
            const d = checkDownload(page);
            await page.click("#goPanel button.amounttable-download");
            const downloaded = await d;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=GO_terms-biological_process-export.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows).toHaveLength(1 /* header*/ + 4 /* results*/ + 1 /* newline*/);
            expect(downloadedRows[0]).toBe("Weight (%),GO term,Name");
        });

        it("should allow downloadig the summary CSV", async () => {
            expect.assertions(5);
            const d = checkDownload(page);
            await page.click("#mpa-download-results");
            const downloaded = await d;
            expect(downloaded).toHaveProperty("headers.content-disposition", "attachment; filename=mpa_result.csv");
            expect(downloaded).toHaveProperty("headers.content-type", expect.stringMatching("text/csv"));
            expect(downloaded).toHaveProperty("data");
            const downloadedRows = downloaded.data.split("\r\n");
            expect(downloadedRows).toHaveLength(1 /* header*/ + 4 /* results*/ + 1 /* newline*/);
            expect(downloadedRows[0]).toBe("peptide,lca,superkingdom,kingdom,subkingdom,superphylum,phylum,subphylum,superclass,class,subclass,infraclass,superorder,order,suborder,infraorder,parvorder,superfamily,family,subfamily,tribe,subtribe,genus,subgenus,species group,species subgroup,species,subspecies,varietas,forma");
        });
    });
