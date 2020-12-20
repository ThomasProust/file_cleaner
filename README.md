# File Cleaner

## About

File cleaner will scan a repository recursively in order to find any duplicate file and log them on the console stating the
path of the files that are duplicates and their content.

## Installation

File Cleaner is made with javascript and therefore require `NodeJs` and `npm`.

```
npm install
```

## Usage

You can either put the repository to scan inside the target directory and run:

```
node index.js
```

Or you add an absolute path to the directory to scan as a argument to the command line:

```
node index.js /Users/me/Pictures
```

## Testing

The dependencies used for testing are `jest` and `fs-extra` (to create a file structure).

For a simple check:

```
npm run test
```

For TDD, it is recommend to use the watch mode:

```
npm run test:dev
```
