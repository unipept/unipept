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
        sunburst,
        treemap;

    /*************** Private methods ***************/

    /**
     * Initializes Multisearch
     */
    function init() {
        // sunburst
        try {
            sunburst = constructSunburst({data : JSON.parse(JSON.stringify(data))});
        } catch (err) {
            error(err.message, "Loading the Sunburst visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }

        // treemap
        //try {
            treemap = constructTreemap({data : JSON.parse(JSON.stringify(data))});
            /*} catch (err) {
            error(err.message, "Loading the Treemap visualization failed. Please use Google Chrome, Firefox or Internet Explorer 9 or higher.");
        }*/

    }

    /*************** Public methods ***************/

    // initialize the object
    init();

    return that;
};
