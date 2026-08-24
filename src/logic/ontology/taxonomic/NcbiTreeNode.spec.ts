import { describe, it, expect, vi } from 'vitest';
import NcbiTreeNode from './NcbiTreeNode';

describe('NcbiTreeNode', () => {
    it('should create a node with correct properties', () => {
        const node = new NcbiTreeNode(1, 'root', 'root');
        expect(node.id).toBe(1);
        expect(node.name).toBe('root');
        expect(node.extra.rank).toBe('root');
        expect(node.children).toEqual([]);
        expect(node.selfCount).toBe(0);
        expect(node.count).toBe(-1);
    });

    it('should add children correctly', () => {
        const parent = new NcbiTreeNode(1, 'root');
        const child = new NcbiTreeNode(2, 'child');
        parent.addChild(child);
        expect(parent.children).toContain(child);
        expect(parent.getChildCount()).toBe(1);
    });

    it('should find children by id', () => {
        const parent = new NcbiTreeNode(1, 'root');
        const child = new NcbiTreeNode(2, 'child');
        parent.addChild(child);
        expect(parent.getChild(2)).toBe(child);
        expect(parent.getChild(3)).toBeNull();
    });

    it('should calculate counts correctly', () => {
        const parent = new NcbiTreeNode(1, 'root');
        parent.selfCount = 10;

        const child1 = new NcbiTreeNode(2, 'child1');
        child1.selfCount = 5;

        const child2 = new NcbiTreeNode(3, 'child2');
        child2.selfCount = 3;

        const grandChild = new NcbiTreeNode(4, 'grandChild');
        grandChild.selfCount = 2;

        parent.addChild(child1);
        parent.addChild(child2);
        child1.addChild(grandChild);

        // Calculate counts
        expect(parent.getCounts()).toBe(20); // 10 + 5 + 3 + 2
        expect(child1.getCounts()).toBe(7); // 5 + 2
        expect(child2.getCounts()).toBe(3); // 3
        expect(grandChild.getCounts()).toBe(2); // 2
    });

    it('should call recursively', () => {
        const parent = new NcbiTreeNode(1, 'root');
        const child = new NcbiTreeNode(2, 'child');
        parent.addChild(child);

        const visitedIds: number[] = [];

        // The implementation of callRecursively uses f.call(this), so we need to use a standard function to access 'this'
        // or rely on the fact that it DOES NOT pass the node as an argument, contrary to the type definition.

        // Using a spy to check what it's called with
        const spy = vi.fn();

        // We wrap it to match the signature expected (ignoring the implementation detail for a moment)
        // actually if we pass a function, 'this' will be the node.

        parent.callRecursively(function(this: NcbiTreeNode) {
            visitedIds.push(this.id);
            spy();
        });

        expect(visitedIds).toContain(1);
        expect(visitedIds).toContain(2);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should call recursively post order', () => {
        const parent = new NcbiTreeNode(1, 'root');
        const child = new NcbiTreeNode(2, 'child');
        parent.addChild(child);

        const results: any[] = [];

        parent.callRecursivelyPostOrder((node, childResults) => {
            results.push({ id: node.id, childResults });
            return node.id;
        });

        // Child should be processed first (post order logic in terms of result usage,
        // but the function call happens: children processed first, then current node)

        // Implementation:
        // if (children) { childResults = children.map(...) }
        // return f(this, childResults)

        // So child is processed, returns 2.
        // Parent is processed, receives [2]. Returns 1.

        expect(results[0].id).toBe(2);
        expect(results[0].childResults).toEqual([]);

        expect(results[1].id).toBe(1);
        expect(results[1].childResults).toEqual([2]);
    });
});
