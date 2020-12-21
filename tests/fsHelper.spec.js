const fs = require('fs-extra');
const fsHelper = require('../src/fsHelper');

describe('fsHelper', () => {
    const path = __dirname + '/fshelper_temp';
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

    it('should get the content of a repository', async () => {
        const expected = {
            files: new Map([
                [Buffer.from('content1'), [path + '/file1']],
                [Buffer.from('content2'), [path + '/file2']],
            ]),
            dirs: ['n1', 'n2'],
        };

        const result = await fsHelper.scanDirectory(path);

        expect(result.data).toEqual(expected.files);
        expect(result.dirs.sort()).toEqual(expected.dirs.sort());
    });

    it('should map files with the same content under the same key', async () => {
        const expected = new Map([
            [Buffer.from('content1'), [path + '/file3', path + '/file1']],
            [Buffer.from('content2'), [path + '/file2']],
        ]);
        fs.writeFileSync(path + '/file3', 'content1');

        const result = await fsHelper.scanDirectory(path);

        expect(result.data).toEqual(expected);
    });

    it('should ignore content that is neither a file nor a repository', async () => {
        const expected = new Map([
            [Buffer.from('content1'), [path + '/file1']],
            [Buffer.from('content2'), [path + '/file2']],
        ]);
        fs.createSymlink(path + '/file1', path + '/symlink');

        const result = await fsHelper.scanDirectory(path);

        expect(result.data).toEqual(expected);
    });
});
