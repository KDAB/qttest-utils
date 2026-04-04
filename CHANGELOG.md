# Changelog

## [2.5.0](https://github.com/KDAB/qttest-utils/compare/v2.4.4...v2.5.0) (2026-04-04)


### Features

* move to node22 ([9918007](https://github.com/KDAB/qttest-utils/commit/9918007bb7765d0363452afdab06856d8505cf18))


### Bug Fixes

* Remove the npm publish stuff from CI ([84069f5](https://github.com/KDAB/qttest-utils/commit/84069f594073c1ea54fe58915aa1beb70353d7e0))

## [2.4.4](https://github.com/KDAB/qttest-utils/compare/v2.4.3...v2.4.4) (2026-04-04)


### Bug Fixes

* Add verbose flag to publish ([1db610e](https://github.com/KDAB/qttest-utils/commit/1db610e9a372c88435460140e6e31769649bfcd0))

## [2.4.3](https://github.com/KDAB/qttest-utils/compare/v2.4.2...v2.4.3) (2026-04-04)


### Bug Fixes

* normalize repository url for npm provenance ([4c74b4b](https://github.com/KDAB/qttest-utils/commit/4c74b4b47bb170840be6a1b3ae6e7d70ed333b97))

## [2.4.2](https://github.com/KDAB/qttest-utils/compare/v2.4.1...v2.4.2) (2026-04-04)


### Bug Fixes

* Testing release process ([01e5b2e](https://github.com/KDAB/qttest-utils/commit/01e5b2e608289f9dc86ff553459276e4fc83a801))

## [2.4.1](https://github.com/KDAB/qttest-utils/compare/v2.4.0...v2.4.1) (2026-04-04)


### Bug Fixes

* Remove cliff and update to new release-please action ([7480c13](https://github.com/KDAB/qttest-utils/commit/7480c132962de8274a7ccfaf84b19a8a5f192bfa))
* Remove unneeded cruft from package ([b33c153](https://github.com/KDAB/qttest-utils/commit/b33c1538da9177ea11c1fd546075e149e32a6738))

## [2.4.0](https://github.com/KDAB/qttest-utils/compare/v2.3.0...v2.4.0) (2026-04-03)


### Features

* bump TypeScript target to ES2022 and add engines field ([9d44860](https://github.com/KDAB/qttest-utils/commit/9d44860dc40b48373b3eaed22abf577e191a84c1))
* rename cmake presets, make Qt6 the default ([#6](https://github.com/KDAB/qttest-utils/issues/6)) ([f60b6e7](https://github.com/KDAB/qttest-utils/commit/f60b6e72fdc1d6b3e86fb840c80aa8498c5bac94))


### Bug Fixes

* add rootDir to tsconfig to fix TS5011 with ES2022 target ([d921982](https://github.com/KDAB/qttest-utils/commit/d921982bbbda550f22aa764b6e138bd5fe761771))

## [2.3.0](https://github.com/KDAB/qttest-utils/compare/v2.2.2...v2.3.0) (2024-06-06)


### Features

* Add support for QEXPECT_FAIL ([0037921](https://github.com/KDAB/qttest-utils/commit/003792112bd6093640e772dcfd109812f38324bd))
* Add support for XPASS ([a60be6b](https://github.com/KDAB/qttest-utils/commit/a60be6b81f22d3a18ee624e2414e91c37e2c607f))


### Bug Fixes

* Fix JSON output from ctest not being received ([9cea2c3](https://github.com/KDAB/qttest-utils/commit/9cea2c3dd4b5798f7f6f0bf382e5eca1694f0eb2))
* Use tap-parser instead of regexp to parse tap files ([3d9f1f5](https://github.com/KDAB/qttest-utils/commit/3d9f1f5abc77d2af1a57ba6a75b89c8a3ad424ed))

# Changelog



## [2.2.2] - 2024-05-02

### 🐛 Bug Fixes

- Filter out weird tests

### ⚙️ Miscellaneous Tasks

- Code format cmake.ts

## [2.2.1] - 2024-05-02

### 🐛 Bug Fixes

- Fix running non-Qt tests
- Harden code against exception when reading .tap file

### 🧪 Testing

- Try fixing tests on macOS/Windows
- Try harder to fix macOS/Windows tests

### ⚙️ Miscellaneous Tasks

- Ran code format on tests
- Run codeformat on qttest.ts
- Bump version

## [2.2.0] - 2024-04-25

### 🚀 Features

- Allow to workaround microsoft/vscode-cmake-tools-api/issues/7

### ⚙️ Miscellaneous Tasks

- Bump version

## [2.1.1] - 2024-04-25

### 🐛 Bug Fixes

- Allow for backslashes in the cmake codemodel

### ⚙️ Miscellaneous Tasks

- Improve CONTRIBUTING.md
- Bump version

## [2.1.0] - 2024-04-25

### 🚀 Features

- Add targetNameForExecutable()

### 🐛 Bug Fixes

- Ignore non-executable targets

### ⚙️ Miscellaneous Tasks

- Coding style improvement
- Update CONTRIBUTING.md file
- Fix build on macOS
- Improve CONTRIBUTING.md
- Bump version

## [2.0.0] - 2024-04-24

### 🚀 Features

- [**breaking**] Use a member to hold the output function

### ⚙️ Miscellaneous Tasks

- Bump version

## [1.4.0] - 2024-04-24

### 🚀 Features

- Allow the caller to pass a output callback

### 🐛 Bug Fixes

- When running a qttest, output to stdout

### ⚙️ Miscellaneous Tasks

- Bump version

## [1.3.0] - 2024-04-23

### 🚀 Features

- Add cppFilesForExecutable(executable, codemodel)

### 🧪 Testing

- Add an example cmake code model
- Normalize paths
- Simplify some code
- Fix replacing slashes

### ⚙️ Miscellaneous Tasks

- Add more logging
- Bump version

## [1.2.0] - 2024-04-22

### 🚀 Features

- Added executablesContainingSlot(name) public method

### 📚 Documentation

- Minor CONTRIBUTIND.md improvement
- Minor CONTRIBUTIND.md improvement

### 🧪 Testing

- Fix test on windows

### ⚙️ Miscellaneous Tasks

- Bump version

## [1.1.2] - 2024-04-07

### ⚙️ Miscellaneous Tasks

- Add more logging
- Bump version

## [1.1.1] - 2024-04-07

### 🐛 Bug Fixes

- Verbose logging not appearing in vscode

### ⚙️ Miscellaneous Tasks

- Improve CONTRIBUTING.md
- Bump version

## [1.1.0] - 2024-04-07

### 🚀 Features

- Added QtTest.verbose property

### 🧪 Testing

- Add a QBENCHMARK
- Fix tests on windows
- Fix more cases of wrong slashes
- Test linksToQtTestLib too

### ⚙️ Miscellaneous Tasks

- Minor readme comment
- Update .npmignore
- Fix typo in README
- Fix badge urls in README
- Mention the vscode extension in the README
- Remove duplicate vscode workspace file
- Add macOS and Windows to CI
- Make npm install be verose
- Trying fixing the path for tsc on macos
- Update packages
- Bump version

## [1.0.0] - 2024-04-04

### 🧪 Testing

- Add a proper test and add it to cI

### ⚙️ Miscellaneous Tasks

- Add a git-cliff configuration file
- Add pre-commit support
- README improvements
- Add installation instructions to README
- Add a Dockerfile with nodejs 18
- *(ci)* Make pre-commit run on master branch
- Update version in package-lock.json
- *(docker)* Install npm, Qt5 and typescript
- *(ci)* Run tsc in ci
- *(ci)* Fix typo in yml file
- *(ci)* Bump to checkout v4
- *(ci)* Bump to setup-node v4
- *(ci)* Rename main ci job to 'build'
- *(vscode)* Add a workspace file
- Formatted some code automatically
- Fix typo in comment
- *(ci)* Install Qt and ninja
- Bump to version 1.0.0
- Regenerate out/
- Add a CONTRIBUTING.md file
- Update changelog
- Add ci badges to readme

## [0.4.9] - 2023-04-06

### 🧪 Testing

- Make test3 abort at the beginning

## [0.4.7] - 2023-04-02

### 🧪 Testing

- Rename the test slots

### README

- Explain how to run the example

### Minor

- Ran formatting
- Pass the entire slot
