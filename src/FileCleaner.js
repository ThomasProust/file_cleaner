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
        this.tree.traverseDf(this.findDuplicatesFromNode.bind(this));
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

    logDuplicates() {
        if (!this.multis.size) {
            console.log('no duplicated file found');
        }
        for (const [content, paths] of [...this.multis.entries()]) {
            console.log('==============================');
            console.log(
                `The following content ${content.toString(
                    'base64'
                )} has been found at the following locations:`
            );
            paths.forEach((p) => console.log(p));
            console.log('==============================');
        }
    }
}

module.exports = FileCleaner;
