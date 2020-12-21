const fsHelper = require('./fsHelper');

class Node {
    static async buildNode(path) {
        const { data, dirs } = await fsHelper.scanDirectory(path);
        const n = new Node(data);
        if (dirs.length) {
            const children = await Promise.all(dirs.map((d) => Node.buildNode(path + '/' + d)));
            n.add(children);
        }

        return n;
    }

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
        t.root = await Node.buildNode(path);
        return t;
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
