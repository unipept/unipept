/* global global */


let globalFetchData = {};
let mock = null;

const setupFetch = (newFetchData = null) => {
    const fetchData = newFetchData === null ? globalFetchData : newFetchData;
    global.fetch = jest.fn().mockImplementation((url, data) => {
        let p = new Promise((resolve, reject) => {
            if (url in fetchData) {
                let thedata;
                let found = false;
                for (let d of fetchData[url]) {
                    if (d.test(data)) {
                        thedata = d.value(data);
                        found = true;
                        break;
                    }
                }

                if (found) {
                    resolve({
                        headers: [],
                        redirected: false,
                        status: 200,
                        statusText: "OK",
                        url: url,
                        useFinalURL: true,
                        ok: true,
                        Id: "123",
                        json: function () {
                            return thedata;
                        },
                    });
                }
                reject("NOT FOUND, no params mathed");
            } else {
                reject("NOT FOUND " + url);
            }
        });

        return p;
    });
    mock = global.fetch.mock;
};

module.exports = {
    setData: newData => {
        globalFetchData = newData;
    },
    setup: setupFetch,
    getMock: () => mock,
};
