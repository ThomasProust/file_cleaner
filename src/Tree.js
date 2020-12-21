const fs = require('fs');

class Node {
    constructor(data) {
        this.data = data;
        this.children = [];
    }

    add(data) {
        if (Array.isArray(data)) {
            this.children.push(...data);
        } else {
            this.children.push(data);
        }
    }
}

class Tree {
    static async buildRepositoryTree(path) {
        const t = new Tree();
        t.root = await Tree.buildNode(path);
        return t;
    }

    static async buildNode(path) {
        const dir = await fs.promises.opendir(path);
        const { data, dirs } = await Tree.scanDirectory(dir, path);
        const n = new Node(data);
        if (dirs.length) {
            const children = await Promise.all(dirs.map((d) => Tree.buildNode(path + '/' + d)));
            n.add(children);
        }

        return n;
    }

    static async scanDirectory(dir, path) {
        const data = new Map();
        const dirs = [];
        for await (const elt of dir) {
            if (elt.isFile()) {
                const content = fs.readFileSync(path + '/' + elt.name);
                const existingKey = [...data.keys()].find((k) => k.equals(content));
                if (data.has(existingKey)) {
                    const existingPaths = data.get(existingKey);
                    data.set(existingKey, [...existingPaths, path + '/' + elt.name]);
                } else {
                    data.set(content, [path + '/' + elt.name]);
                }
            }
            if (elt.isDirectory()) {
                dirs.push(elt.name);
            }
        }
        return { data, dirs };
    }

    constructor() {
        this.root = null;
    }

    traverseDf(fn) {
        const arr = [this.root];
        while (arr.length) {
            const node = arr.shift();
            arr.unshift(...node.children);
            fn(node);
        }
    }
}

module.exports = { Tree, Node };
