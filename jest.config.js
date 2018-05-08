module.exports = {
    verbose: true,
    roots: ["test/javascripts"],
    moduleDirectories: ["app/assets/javascripts", "node_modules"],
    moduleNameMapper: {
        "^config$": "<rootDir>/path/to/App/config.js",
    },
    transform: {
        "^.+\\.js$": "babel-jest",
        "^workerize-loader!": "workerize-loader",
    },
    coveragePathIgnorePatterns: ["/node_modules/", "/test/javascripts"],
};
