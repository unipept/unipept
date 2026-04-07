import { DEFAULT_PATHWAY_PILOT_BASE_URL } from "@/logic/Constants";

export interface PathwayInfo {
    name: string;
    category: string;
    subCategory: string;
    compoundIds: string[];
}

export interface EcInfo {
    names: string[];
    pathways: { id: string; name: string }[];
}

export interface CompoundInfo {
    names: string[];
}

export interface PathwayVisualizationData {
    image: string;
    nodes: any[];
}

export default class PathwayPilotCommunicator {
    constructor(
        private readonly apiBaseUrl: string = DEFAULT_PATHWAY_PILOT_BASE_URL
    ) {}

    public async fetchPathwayMapping(): Promise<Map<string, PathwayInfo>> {
        return this.fetchMapping(`${this.apiBaseUrl}/mapping/pathway`);
    }

    public async fetchEcMapping(): Promise<Map<string, EcInfo>> {
        return this.fetchMapping(`${this.apiBaseUrl}/mapping/ec`);
    }

    public async fetchCompoundMapping(): Promise<Map<string, CompoundInfo>> {
        return this.fetchMapping(`${this.apiBaseUrl}/mapping/compound`);
    }

    public async fetchPathwayVisualization(id: string): Promise<PathwayVisualizationData> {
        return this.fetchJSON(`${this.apiBaseUrl}/pathway/${id}`);
    }

    private async fetchJSON(url: string): Promise<any> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`PathwayPilot request failed: ${response.status} ${response.statusText} (${url})`);
        }
        return response.json();
    }

    private async fetchMapping(url: string): Promise<Map<string, any>> {
        const data = await this.fetchJSON(url);
        return new Map(Object.entries(data));
    }
}
