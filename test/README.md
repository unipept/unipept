# Testing  the code

## Backend web server

The web server can be tested by using `rails test` this will do the following

1. Setup a testing database from the data contained in [fixtures](./fixtures) and the schema in [/db/schema.rb](/db/schema.rb).
2. Run the unit tests for the models in [models](./models)
   - These unit test the functionality for the model methods
   - The files should be named `{modelname}_test.rb`
3. Run the integration tests for the controllers in [controllers](./controllers)
   - These run integration tests to verify that the output of a controller is what is expected given the input
   - The files should be named `{controllername}_test.rb`

## Front end

The front end can be tested with `yarn test` and `yarn test-puppeteer`. Adding a filename as argument will limit a test to that file.

The tests use the [jest API](https://facebook.github.io/jest/docs/en/api.html) and the [puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md).

## Unit test with `yarn test`

`yarn test` executes the jest unit tests specified in the [javascripts](./javascripts) folder.

The test are executed with `node`  after compilation with babel according to the `test` environment specified in the [/.babelrc.json](/.babelrc.json). Therefore webpacker and some babel issues will go undetected. jQuery and D3 are not available during the test.

A file that checks `/app/assets/javascripts/path/file.js` should be named `/test/javascripts/path/file.test.js`

The jest configuration file is located at [/jest.config.js](/jest.config.js)

To check the coverage of the code the flag  `--coverage`  can be added to `yarn test`

## Integration tests with `yarn test-puppeteer`

`yarn test-puppeteer` executes the tests in the [puppeteer](./puppeteer) folder with puppeteer and jest.

Puppeteer is available to the test as `global.__BROWSER__`.

To check downloads and their content, a global function `checkDownload(Page page)` is provided.  It catches the first request with `content-disposition: attachment` and checks the download folder for new files. Once a new file occurs in the download folder the returned promise is resolved with the content of the file.

- Param `page` is the current  `Puppeteer.Page`
- Returns a `Promise<DownloadData>`
- With `DownloadData` an object with the properties
  - `headers`: The headers of the download request
  - `data`:  The content of the downloaded file
- Note that this function is not thread safe



The jest configuration file is located at [/jest.puppeteer.config.js](/jest.puppeteer.config.js) . This file references the setup and teardown files used to setup puppeteer.

A file that checks `http://.../path` should be named `/test/puppeteer/path/page.test.js`. Other names than `page.test.js` may be used if the test is split up. In that case each filename should describe what is tested.