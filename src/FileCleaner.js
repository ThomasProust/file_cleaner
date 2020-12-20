const { Tree } = require('./Tree');

class FileCleaner {
    static async build(path) {
        const tree = await Tree.buildRepositoryTree(path);
        return new FileCleaner(tree);
    }

    constructor(tree) {
        this.tree = tree;
        this.singles = new Map();
        this.multis = new Map();
    }

    scanForDuplicates() {
        this.tree.traverseBf(this.findDuplicatesFromNode.bind(this));
    }

    findDuplicatesFromNode(n) {
        for (const [content, paths] of [...n.data.entries()]) {
            const mKeys = [...this.multis.keys()];
            const sKeys = [...this.singles.keys()];

            if (!paths.length) continue;

            const fromMultiContent = mKeys.find((k) => k.equals(content));

            if (fromMultiContent) {
                const existingPaths = this.multis.get(fromMultiContent);
                this.multis.set(fromMultiContent, [...existingPaths, ...paths]);
                continue;
            }

            const fromSingleContent = sKeys.find((k) => k.equals(content));
            if (fromSingleContent) {
                const existingPaths = this.singles.get(fromSingleContent);
                this.multis.set(content, [...existingPaths, ...paths]);

                this.singles.delete(fromSingleContent);
                continue;
            }

            paths.length > 1
                ? this.multis.set(content, [...paths])
                : this.singles.set(content, [...paths]);
        }
    }
}

module.exports = FileCleaner;
