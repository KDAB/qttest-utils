// SPDX-FileCopyrightText: 2024 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

import { QtTest, QtTests } from "./qttest";

// Be sure to build the Qt tests with CMake first
// See .github/workflows/ci.yml

async function runTests(buildDirPath: string) {
    let qt = new QtTests();
    await qt.discoverViaCMake(buildDirPath);

    let expected_executables = [
        "test/qt_test/build-dev/test1",
        "test/qt_test/build-dev/test2",
        "test/qt_test/build-dev/test3"];

    if (qt.qtTestExecutables.length != expected_executables.length) {
        console.error("Expected 3 executables, got " + qt.qtTestExecutables.length);
        process.exit(1);
    }

    // 1. Test that the executable test names are correct:
    var i = 0;
    for (var executable of qt.qtTestExecutables) {
        let expected = expected_executables[i];
        if (executable.relativeFilename() != expected) {
            console.error("Expected executable " + expected + ", got " + executable.relativeFilename());
            process.exit(1);
        }
        i++;
    }

    // 2. Test that the discovered slots are correct:
    await qt.dumpTestSlots();

    interface ExpectedSlots {
        [key: string]: string[];
    }
    let expected_slots: ExpectedSlots = {
        "test/qt_test/build-dev/test1": ["testA", "testB", "testC"],
        "test/qt_test/build-dev/test2": ["testD", "testE", "testF"],
        "test/qt_test/build-dev/test3": ["testAbortsEverythig", "testH", "testI"],
    };

    for (var executable of qt.qtTestExecutables) {
        var i = 0;

        for (let slot of executable.slots!) {

            let expected_slot = expected_slots[executable.relativeFilename()][i];
            if (slot.name != expected_slot) {
                console.error("Expected slot " + expected_slot + ", got " + slot.name);
                process.exit(1);
            }
            i++;
        }
    }

    // 3. Run the tests:
    let expected_success = [true, false, false];
    var i = 0;
    for (var executable of qt.qtTestExecutables) {
        await executable.runTest();
        let wasSuccess = executable.lastExitCode === 0;
        if (wasSuccess && !expected_success[i]) {
            console.error("Expected test to fail: " + executable.filename);
            process.exit(1);
        } else if (!wasSuccess && expected_success[i]) {
            console.error("Expected test to pass: " + executable.filename);
            process.exit(1);
        }

        i++;
    }

    // 4. Run individual slots:
    let slot = qt.qtTestExecutables[0].slots![0];
    await slot.runTest();
    if (slot.lastTestFailure) {
        console.error("Expected test to pass: " + slot.name);
        process.exit(1);
    }

    let slot2 = qt.qtTestExecutables[1].slots![2];
    await slot2.runTest();
    if (!slot2.lastTestFailure) {
        console.error("Expected test to fail: " + slot2.name);
        process.exit(1);
    }
}

runTests("test/qt_test/build-dev/");
