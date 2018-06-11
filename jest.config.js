module.exports = {
    verbose: true,
    roots: ["test/javascripts"],
    moduleDirectories: ["app/assets/javascripts", "node_modules"],
    transform: {
        "^.+\\.js$": "babel-jest",
        "^workerize-loader!": "workerize-loader",
    },
    coveragePathIgnorePatterns: ["/node_modules/", "/test/javascripts"],
};
