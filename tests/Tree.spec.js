const fs = require('fs-extra');
const { Tree, Node } = require('../src/Tree');

describe('buildRepositoryTree', () => {
    const path = __dirname + '/tree_temp';
    beforeAll(() => {
        fs.removeSync(path);
        fs.mkdirSync(path);
    });
    afterAll(() => {
        fs.removeSync(path);
    });

    beforeEach(() => {
        fs.writeFileSync(path + '/file1', 'content1');
        fs.writeFileSync(path + '/file2', 'content2');
        fs.mkdirSync(path + '/n1');
        fs.mkdirSync(path + '/n2');
    });

    afterEach(() => {
        fs.emptyDirSync(path);
    });
    it('should create root with map as data and two empty children', async () => {
        const expected = new Map([
            [Buffer.from('content1'), [path + '/file1']],
            [Buffer.from('content2'), [path + '/file2']],
        ]);

        const tree = await Tree.buildRepositoryTree(path);

        expect(tree.root.data).toEqual(expected);
        expect(tree.root.children).toEqual([new Node(new Map()), new Node(new Map())]);
    });

    it('should create a two level tree', async () => {
        fs.writeFileSync(path + '/n1/file1', 'content3');
        const n1Expected = new Map([
            [Buffer.from('content1'), [path + '/file1']],
            [Buffer.from('content2'), [path + '/file2']],
        ]);
        const n2Expected = new Map([[Buffer.from('content3'), [path + '/n1/file1']]]);

        const tree = await Tree.buildRepositoryTree(path);

        expect(tree.root.data).toEqual(n1Expected);
        expect(tree.root.children).toHaveLength(2);
        expect(tree.root.children[0].data).toEqual(n2Expected);
    });

    it('should create a three level tree with several subtrees', async () => {
        fs.writeFileSync(path + '/n1/file1', 'content3');
        fs.mkdirSync(path + '/n1a');
        fs.writeFileSync(path + '/n1a/file1', 'content4');
        fs.writeFileSync(path + '/n1a/file2', 'content5');
        fs.mkdirSync(path + '/n1/n2');
        fs.writeFileSync(path + '/n1/n2/file1', 'content6');
        fs.writeFileSync(path + '/n1/n2/file2', 'content7');

        const tree = await Tree.buildRepositoryTree(path);

        expect(tree.root.children).toHaveLength(3);
        const firstChild = tree.root.children[0];
        expect(firstChild.data).toEqual(new Map([[Buffer.from('content3'), [path + '/n1/file1']]]));
        expect(firstChild.children).toHaveLength(1);
        expect(firstChild.children[0].data).toEqual(
            new Map([
                [Buffer.from('content6'), [path + '/n1/n2/file1']],
                [Buffer.from('content7'), [path + '/n1/n2/file2']],
            ])
        );
    });
});
