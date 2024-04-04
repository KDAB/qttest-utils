# nodejs qttest-utils

![Build Status](https://github.com/KDAB/qttest-utils/actions/workflows/ci.yml/badge.svg)
![Pre-commit](https://github.com/KDAB/qttest-utils/actions/workflows/pre-commit.yml/badge.svg)

A [nodejs](https://www.npmjs.com/package/@iamsergio/qttest-utils) module for listing Qt Test executables and their individual test slots from a CMake build directory.

To be used by vscode extensions that implement the `Testing API`, but can also be used standalone for whatever reason ;).

## Installation

```bash
npm i @iamsergio/qttest-utils
```

## Example

```bash
cd test/qt_test
cmake --preset=dev
cmake --build build-dev/
cd ../..
tsc
node out/example.js test/qt_test/build-dev
```
