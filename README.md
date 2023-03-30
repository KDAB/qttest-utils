# nodejs qttest-utils

A nodejs module for listing Qt Test executables and their individual test slots from a CMake build directory.

To be used by vscode extensions that implement the `Testing API`, but can also be used standalone for whatever reason ;).


## Example

```
$ cd test/qt_test
$ cmake --preset=dev
$ cmake --build build-dev/
$ cd ../..
$ tsc
$ node out/example.js test/qt_test/build-dev
```
