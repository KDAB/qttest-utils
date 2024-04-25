# Tips for contributors

## Prepare your development environment

Just follow `.devcontainer/Dockerfile` to see what's needed.<br?>
Basically it's just `nodejs` >= v18 `tsc` and `npm`. <br>
Qt5, cmake and ninja if you want to run the tests.


## Running tests

```bash
tsc
node out/test.js
```

Or simply let GitHub actions run the tests for you.<br>
See `ci.yml` for how we run the tests.

## Install git-cliff

```bash
cargo install git-cliff
```

## Releasing

(Replace 1.0.0 with actual version used)
- Get a version compatible with semver, run ` git cliff --bump | head -n 5`, replace NEW_VERSION
- export NEW_VERSION=v1.0.0
- Make sure Github Actions CI is green
- npm version $NEW_VERSION
- git cliff --tag $NEW_VERSION > Changelog
- git add Changelog package.json package-lock.json && git commit -m "chore: bump version" && git tag -a ${NEW_VERSION} -m "${NEW_VERSION}" && git push && git push --tags && npm publish
