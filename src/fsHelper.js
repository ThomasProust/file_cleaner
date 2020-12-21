const fs = require('fs');

const scanDirectory = async (path) => {
    const dir = await fs.promises.opendir(path);

    const data = new Map();
    const dirs = [];
    for await (const elt of dir) {
        if (elt.isFile()) {
            mapPathToContent(data, elt, path);
        }
        if (elt.isDirectory()) {
            dirs.push(elt.name);
        }
    }
    return { data, dirs };
};

const mapPathToContent = (map, elt, basePath) => {
    const filePath = basePath + '/' + elt.name;
    const content = fs.readFileSync(filePath);
    const existingKey = [...map.keys()].find((k) => k.equals(content));
    if (map.has(existingKey)) {
        const existingPaths = map.get(existingKey);
        map.set(existingKey, [...existingPaths, filePath]);
    } else {
        map.set(content, [filePath]);
    }
};

module.exports = { scanDirectory };
