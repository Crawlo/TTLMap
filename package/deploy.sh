#!/bin/sh -e

rm -rf ./npm

npm --no-git-tag-version version patch

npm run build

node -e "const package = require('./package.json'), fs = require('fs'); \
    delete package.scripts; \
    fs.writeFileSync('./dist/package.json', JSON.stringify(package, null, 2));
"

cp README.md npm/

cd npm && npm publish --access=public

cd ../

rm -rf ./npm