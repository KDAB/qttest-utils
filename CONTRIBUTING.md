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

- Make sure Github Actions CI is green
- Optional: To get a version compatible with semver, run `git cliff --bump`
- Increase version in package.json and package-lock.json.
- git cliff --tag 1.0.0 > Changelog
- git add Changelog package.json package-lock.json && git commit -m "chore: bump version"
- git tag -a v1.0.0 -m 'v1.0.0'
- git push --tags
- npm publish
