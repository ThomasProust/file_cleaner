# File Cleaner

## About

File cleaner will scan a repository recursively in order to find any duplicated file and log them on the console stating the
path of the files that are duplicates and their content.

## How it works

The program will first build a tree from the given espository structure and format the content of each sub-repository into a Map with the content and the path of each file.
Once the tree is built, the program traverses it depth first to find files with the same content and store them in a dedicated map.
For performance reasons, the content of the file is kept as a Buffer until the very end. The tree is traversed depth first because usually users tend to organize their pictures in such a way that the tree's breadth becomes very large, hence depth first should more memory efficient in most cases.

## Installation

File Cleaner is made with javascript and therefore requires `NodeJs` and `npm`.

```
npm install
```

## Usage

You can either put the repository to scan inside the target directory and run:

```
node index.js
```

Or you add an absolute path to the directory to scan as an argument to the command line:

```
node index.js /Users/me/Pictures
```

## Testing

The dependencies used for testing are `jest` and `fs-extra` (to create a file structure).

For a simple check:

```
npm run test
```

For TDD, it is recommended to use the watch mode:

```
npm run test:dev
```
