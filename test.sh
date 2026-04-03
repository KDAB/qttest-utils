cmake --preset=dev -S test/qt_test && \
cmake --build test/qt_test/build-dev && \
tsc && node out/test.js
