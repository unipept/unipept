declare const window: any;

export default class AnalyticsCommunicator {
    public async logRoute(route: any) {
        // Log the path of the route
        this.logPageView(route.path);

        // Log the search parameters of a tpa search
        // This is the only route that has parameters
        if (Object.keys(route.params).length !== 0) {
            this.logSearchTpa(route.params.sequence, route.query.equate === "true");
        }
    }

    public logSearchMpa(sequenceAmount: number, equateIl: boolean, filterDuplicates: boolean, missedCleavages: boolean, reprocessed: boolean) {
        // search_mpa is the event_name as defined in the Google Analytics dashboard
        this.logEvent('search_mpa', {
            event_name: 'mpa',
            sequenceAmount: sequenceAmount,
            equateIl: equateIl,
            filterDuplicates: filterDuplicates,
            missedCleavages: missedCleavages,
            reprocessed: reprocessed
        });
    }

    public logDownloadMpa(format: string) {
        // download_mpa is the event_name as defined in the Google Analytics dashboard
        this.logEvent('download_mpa', { event_name: 'mpa', download_format: format });
    }

    public logDownloadVisualization(analysis: string, format: string, visualisation: string) {
        // download_visualisation is the event_name as defined in the Google Analytics dashboard
        this.logEvent('download_visualisation', {
            event_name: 'visualisation',
            analysis: analysis,
            download_format: format,
            visualisation: visualisation
        });
    }

    private logEvent(event_name: string, event_params: any) {
        if (process.env.NODE_ENV !== 'production') {
            // We are running the app in development mode and we don't want to log any requests...
            return;
        }

        // @ts-ignore (TODO add to global types)
        this.gtag('config', 'G-P3VRXFGD5B', { 'send_page_view': false });
        // @ts-ignore (TODO add to global types)
        this.gtag('event', event_name, event_params);
    }

    private logPageView(path: string) {
        this.logEvent('page_view', { page_title: path });
    }

    private logSearchTpa(sequence: string, equateIl: boolean) {
        // search_tpa is the event_name as defined in the Google Analytics dashboard
        this.logEvent('search_tpa', { event_name: 'tpa', sequence: sequence, equateIl: equateIl });
    }

    private gtag() {
        window.dataLayer = window.dataLayer || [];

        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
    }
}
