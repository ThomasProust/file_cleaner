const fs = require('fs-extra');
const FileCleaner = require('../src/FileCleaner');
const { Tree, Node } = require('../src/Tree');

describe('file cleaner', () => {
    const path = __dirname + '/fc_temp';
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

    it('should create an instance with a built tree', async () => {
        const fc = await FileCleaner.build(path);
        const rootNode = new Node(
            new Map([
                [Buffer.from('content1'), [path + '/file1']],
                [Buffer.from('content2'), [path + '/file2']],
            ])
        );
        rootNode.add([new Node(new Map()), new Node(new Map())]);
        const expected = new Tree();
        expected.root = rootNode;

        expect(fc.tree).toEqual(expected);
    });

    describe('scan node for duplicates', () => {
        it('should not find any duplicates if contents are different', async () => {
            expectedMultis = new Map();
            expectedSingles = new Map([
                [Buffer.from('content1'), [path + '/file1']],
                [Buffer.from('content2'), [path + '/file2']],
            ]);
            const fc = await FileCleaner.build(path);

            fc.findDuplicatesFromNode(fc.tree.root);

            expect(fc.multis).toEqual(expectedMultis);
            expect(fc.singles).toEqual(expectedSingles);
        });

        it('should find duplicates when there are files with matching content in the same repository', async () => {
            expectedMultis = new Map([
                [Buffer.from('content1'), [path + '/file3', path + '/file1']],
            ]);
            expectedSingles = new Map([[Buffer.from('content2'), [path + '/file2']]]);
            fs.writeFileSync(path + '/file3', 'content1');
            const fc = await FileCleaner.build(path);

            fc.findDuplicatesFromNode(fc.tree.root);

            expect(fc.multis).toEqual(expectedMultis);
            expect(fc.singles).toEqual(expectedSingles);
        });

        it('should add duplicates to already existing ones', async () => {
            expectedMultis = new Map([
                [Buffer.from('content1'), [path + '/file4', path + '/file3', path + '/file1']],
            ]);
            expectedSingles = new Map([[Buffer.from('content2'), [path + '/file2']]]);
            fs.writeFileSync(path + '/file3', 'content1');
            const fc = await FileCleaner.build(path);
            fc.multis.set(Buffer.from('content1'), [path + '/file4']);

            fc.findDuplicatesFromNode(fc.tree.root);

            expect(fc.multis).toEqual(expectedMultis);
            expect(fc.singles).toEqual(expectedSingles);
        });

        it('should remove duplicates from singles and add them to multis', async () => {
            expectedMultis = new Map([
                [Buffer.from('content1'), [path + '/file3', path + '/file1']],
            ]);
            expectedSingles = new Map([[Buffer.from('content2'), [path + '/file2']]]);
            const fc = await FileCleaner.build(path);
            fc.singles.set(Buffer.from('content1'), [path + '/file3']);

            fc.findDuplicatesFromNode(fc.tree.root);

            expect(fc.multis).toEqual(expectedMultis);
            expect(fc.singles).toEqual(expectedSingles);
        });
    });

    describe('Traversing Tree', () => {
        beforeEach(() => {
            fs.emptyDirSync(path);

            fs.writeFileSync(path + '/file1', 'content1');
            fs.writeFileSync(path + '/file2', 'content2');
            fs.mkdirSync(path + '/n1');
            fs.mkdirSync(path + '/n2');
            fs.writeFileSync(path + '/n1/file1', 'content3');
            fs.mkdirSync(path + '/n1a');
            fs.writeFileSync(path + '/n1a/file1', 'content4');
            fs.writeFileSync(path + '/n1a/file2', 'content5');
            fs.mkdirSync(path + '/n1/n2');
            fs.writeFileSync(path + '/n1/n2/file1', 'content6');
            fs.writeFileSync(path + '/n1/n2/file2', 'content7');
        });

        afterEach(() => {
            fs.emptyDirSync(path);
        });
        it('should not find any duplicate if no matching content', async () => {
            expectedMultis = new Map();
            expectedSingles = new Map([
                [Buffer.from('content1'), [path + '/file1']],
                [Buffer.from('content2'), [path + '/file2']],
                [Buffer.from('content3'), [path + '/n1/file1']],
                [Buffer.from('content4'), [path + '/n1a/file1']],
                [Buffer.from('content5'), [path + '/n1a/file2']],
                [Buffer.from('content6'), [path + '/n1/n2/file1']],
                [Buffer.from('content7'), [path + '/n1/n2/file2']],
            ]);
            const fc = await FileCleaner.build(path);

            fc.scanForDuplicates();

            expect(fc.multis).toEqual(expectedMultis);
            expect(fc.singles).toEqual(expectedSingles);
        });

        it('should find all the duplicates in the tree', async () => {
            fs.writeFileSync(path + '/file3', 'content7');
            fs.writeFileSync(path + '/n1a/file3', 'content6');
            const expected = new Map([
                [Buffer.from('content7'), [path + '/file3', path + '/n1/n2/file2']],
                [Buffer.from('content6'), [path + '/n1a/file3', path + '/n1/n2/file1']],
            ]);
            const fc = await FileCleaner.build(path);

            fc.scanForDuplicates();

            expect(fc.multis).toEqual(expected);
        });
    });

    describe('log duplicates', () => {
        beforeEach(() => {
            fs.emptyDirSync(path);

            fs.writeFileSync(path + '/file1', 'content1');
            fs.writeFileSync(path + '/file2', 'content2');
            fs.mkdirSync(path + '/n1');
            fs.mkdirSync(path + '/n2');
            fs.writeFileSync(path + '/n1/file1', 'content3');
            fs.mkdirSync(path + '/n1a');
            fs.writeFileSync(path + '/n1a/file1', 'content4');
            fs.writeFileSync(path + '/n1a/file2', 'content5');
            fs.mkdirSync(path + '/n1/n2');
            fs.writeFileSync(path + '/n1/n2/file1', 'content6');
            fs.writeFileSync(path + '/n1/n2/file2', 'content7');
        });

        afterEach(() => {
            fs.emptyDirSync(path);
        });
        it('should log the duplicated files with the common content', async () => {
            fs.writeFileSync(path + '/file3', 'content7');
            fs.writeFileSync(path + '/n1a/file3', 'content6');
            fs.mkdirSync(path + '/n1/n2/n3');
            fs.writeFileSync(path + '/n1/n2/n3/file1', 'content5');
            console.log = jest.fn();
            const fc = await FileCleaner.build(path);
            fc.scanForDuplicates();

            fc.logDuplicates();

            expect(console.log).toHaveBeenCalledTimes(15);
        });
    });
});
