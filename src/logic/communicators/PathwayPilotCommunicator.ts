const BASE_URL = "https://pathwaypilot.ugent.be/api";

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
    public async fetchPathwayMapping(): Promise<Map<string, PathwayInfo>> {
        return this.fetchMapping(`${BASE_URL}/mapping/pathway`) as Promise<Map<string, PathwayInfo>>;
    }

    public async fetchEcMapping(): Promise<Map<string, EcInfo>> {
        return this.fetchMapping(`${BASE_URL}/mapping/ec`) as Promise<Map<string, EcInfo>>;
    }

    public async fetchCompoundMapping(): Promise<Map<string, CompoundInfo>> {
        return this.fetchMapping(`${BASE_URL}/mapping/compound`) as Promise<Map<string, CompoundInfo>>;
    }

    public async fetchPathwayVisualization(id: string): Promise<PathwayVisualizationData> {
        const response = await fetch(`${BASE_URL}/pathway/${id}`, {
            headers: { "content-type": "application/json" }
        });
        return response.json();
    }

    private async fetchMapping(url: string): Promise<Map<string, any>> {
        const response = await fetch(url, { headers: { "content-type": "application/json" } });
        const data = await response.json();
        return new Map(Object.entries(data));
    }
}
