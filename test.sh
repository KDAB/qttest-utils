cmake --preset=dev -S test/qt_test && \
cmake --build test/qt_test/build-dev && \
tsc && node out/test.js && \
rm -rf test/qt_test/build-dev && \
cmake --preset=dev6 -S test/qt_test && \
cmake --build test/qt_test/build-dev && \
tsc && node out/test.js
