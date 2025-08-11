declare const window: any;

export default class AnalyticsCommunicator {
    public logDownloadVisualization(analysis: string, format: string, visualisation: string) {
        this.logEvent('download_visualisation', {
            analysis: analysis,
            download_format: format,
            visualisation: visualisation
        });
    }

    public logExportProject() {
        this.logEvent('export_project', {});
    }

    public logCreateCustomDatabase(databaseType: string) {
        this.logEvent('create_custom_database', { database_type: databaseType });
    }

    public logLoadProjectFromStorage() {
        this.logEvent('load_project_from_storage');
    }

    public logLoadProjectFromFile() {
        this.logEvent('load_project_from_file');
    }

    public logCreateNewProject() {
        this.logEvent('create_new_project');
    }

    public logLoadDemoProject(demoName: string) {
        this.logEvent('load_demo_project');
    }

    public logQuickAnalysis(peptideCount: number, config: any) {
        this.logEvent('quick_analysis', { 
            peptide_count: peptideCount,
            equate_il: config.equate,
            filter_duplicates: config.filter,
            missed_cleavages: config.missed
        });
    }

    private logEvent(event_name: string, event_params?: any) {
        if (process.env.NODE_ENV !== 'production') {
            // We are running the app in development mode and we don't want to log any requests...
            return;
        }

        // Use Umami's tracking function
        if (window.umami && typeof window.umami.track === 'function') {
            window.umami.track(event_name, event_params);
        }
    }
}
