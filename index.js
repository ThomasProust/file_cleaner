const FileCleaner = require('./src/FileCleaner');

const main = async () => {
    const path = process.argv[2] || `${__dirname}/target`;

    const fc = await FileCleaner.build(path);
    fc.scanForDuplicates();
    fc.logDuplicates();
};

main().catch((e) => console.error(e.message));
