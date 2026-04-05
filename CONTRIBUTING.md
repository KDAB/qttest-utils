# Tips for contributors

## Prepare your development environment

Install `nodejs` >= v20 `tsc` and `npm`. <br>
Qt, cmake and ninja if you want to run the tests.

## Running tests

```bash
sh test.sh
```

Or simply let GitHub actions run the tests for you.<br>
See `ci.yml` for how we run the tests.

## Releasing

Use GitHub's CI action to make a release.

Then run `publish.sh`
