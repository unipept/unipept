module.exports = {
    verbose: true,
    roots: ["test/puppeteer"],
    moduleDirectories: ["app/assets/javascripts", "node_modules"],
    moduleNameMapper: {
        "^config$": "<rootDir>/path/to/App/config.js",
    },
    transform: {
        "^.+\\.js$": "babel-jest",
        "^workerize-loader!": "workerize-loader",
    },
    globalSetup: "./test/puppeteer/setup.js",
    globalTeardown: "./test/puppeteer/teardown.js",
    testEnvironment: "./test/puppeteer/puppeteer_environment.js",
};
