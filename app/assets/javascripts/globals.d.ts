interface Window {
    webkitNotifications: any;
    fullScreenApi: any;
}

interface Object {
    values: function(Object<A,B>): B[],
    entries: [A,B][]
}

declare var _gaq: any[];
declare var html2canvas: any;
declare var eventBus: any;
declare var $: any;
declare var d3: any;

declare namespace D3 {
    type selection = any
}

interface MPAConfig {
    il: boolean
    dupes: boolean,
    missed: boolean
}

interface FATrustInfo {
    trustCount : number,
    annotatedCount : number,
    totalCount : number,
    totalTrust?: number,
    annotatedTrust?:number,
    annotaionAmount?: number
}

interface FAServerInfo {
    data: FAInfo[],
    counts: {
        all: number,
        EC: number,
        GO: number
    }
}

interface FAInfo {
    code: string,
    value : number,
    name: string
}

interface TaxonInfo {
    id: number,
    name: string,
    rank: string,
}

interface PeptideMPAInfo {
    sequence: string, // The peptide sequence
    count: number,    // The number of times the peptide occurs
    lca: number,      // The taxon id of the lca
    lineage: number[] // The lineage of the lca
    fa: FAServerInfo
    faGrouped?: any
}
