/**
 * Constructs a Multisearch object that handles all JavaScript of the
 * metaproteomics analysis results page
 *
 * @return <Multisearch> that The constructed Multisearch object
 */
var constructMultisearch = function constructMultisearch(args) {
    /*************** Private variables ***************/

    var that = {},
        data = args.data,
        sunburst;

    /*************** Private methods ***************/

    /**
     * Initializes Multisearch
     */
    function init() {

        // construct visualisations
        sunburst = constructSunburst({data : JSON.parse(JSON.stringify(data).replace(/children/g, "kids"))});

    }

    /*************** Public methods ***************/

    // initialize the object
    init();

    return that;
};
