export default class TreeViewNode {
    public id: any;
    public name: string;
    public data: any;
    public children: TreeViewNode[];

    constructor(id: any, name: string, data: any, children: TreeViewNode[]) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.children = children;
    }
}