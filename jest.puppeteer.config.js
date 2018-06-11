module.exports = {
    verbose: true,
    roots: ["test/puppeteer"],
    moduleDirectories: ["app/assets/javascripts", "node_modules"],
    transform: {
        "^.+\\.js$": "babel-jest",
        "^workerize-loader!": "workerize-loader",
    },
    globalSetup: "./test/puppeteer/setup.js",
    globalTeardown: "./test/puppeteer/teardown.js",
    testEnvironment: "./test/puppeteer/puppeteer_environment.js",
};
