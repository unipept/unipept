const chalk = require("chalk");
const NodeEnvironment = require("jest-environment-node");
const puppeteer = require("puppeteer");
const fs = require("fs");
const os = require("os");
const path = require("path");

const DIR = path.join(os.tmpdir(), "jest_puppeteer_global_setup");
/** */
class PuppeteerEnvironment extends NodeEnvironment {
    /**
   *
   * @param {*} config
   */
    constructor(config) {
        super(config);
    }

    /**
     *
     */
    async setup() {
        console.log(chalk.yellow("Setup Test Environment."));
        await super.setup();
        const wsEndpoint = fs.readFileSync(path.join(DIR, "wsEndpoint"), "utf8");
        if (!wsEndpoint) {
            throw new Error("wsEndpoint not found");
        }
        this.global.__BROWSER__ = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint,
        });

        this.global.__TMPDIR__ = global.__TMPDIR__;
        const tmpdir = global.__TMPDIR__.name;
        this.global.checkDownload = async page => {
            await page._client.send("Page.setDownloadBehavior", {behavior: "allow", downloadPath: tmpdir});

            let filenameP = new Promise(resolve => {
                let w = fs.watch(this.global.__TMPDIR__.name, {}, (type, filename) => {
                    if (type === "rename" && filename && !filename.endsWith(".crdownload")) {
                        resolve(filename);
                        w.close();
                    }
                });
            });

            let headersP = new Promise(resolve => {
                let listener = resp => {
                    if ("content-disposition" in resp.headers() && resp.headers()["content-disposition"].startsWith("attachment")) {
                        page.removeListener("response", listener);
                        resolve(resp.headers());
                    }
                };

                page.on("response", listener);
            });


            const [filename, headers] = await Promise.all([filenameP, headersP]);
            return new Promise(function (resolve, reject) {
                fs.readFile(path.join(tmpdir, filename), "utf8", (err, data) => {
                    chalk.yellow("File downlaode.");
                    err ? reject({filename: filename, err: err, headers: headers}) : resolve({filename: filename, data: data, headers: headers});
                });
            });
        };
    }

    /**
     *
     */
    async teardown() {
        console.log(chalk.yellow("Teardown Test Environment."));
        await super.teardown();
    }

    /**
     *
     * @param {*} script
     */
    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = PuppeteerEnvironment;
