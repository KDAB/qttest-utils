// SPDX-FileCopyrightText: 2024 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

import { CMakeTests } from "./cmake";
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

    await qt.removeNonLinking();

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

        if (process.platform === "linux") {
            if (!executable.linksToQtTestLib()) {
                console.error("Expected test to link to QtTest: " + executable.filename);
                process.exit(1);
            }
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

    // 5. Test executablesContainingSlot
    let executables = qt.executablesContainingSlot("testB");
    if (executables.length != 1) {
        console.error("Expected 1 executable, got " + executables.length);
        process.exit(1);
    }

    if (!executables[0].filenameWithoutExtension().endsWith("test1")) {
        console.error("Expected filename to end with test1");
        process.exit(1);
    }

    executables = qt.executablesContainingSlot("non_existing");
    if (executables.length != 0) {
        console.error("Expected 0 executables, got " + executables.length);
        process.exit(1);
    }
}

async function runCodeModelTests(codeModelFile: string) {
    const fs = require('fs');
    let codemodelStr = fs.readFileSync(codeModelFile, 'utf8');
    let codemodelJson = JSON.parse(codemodelStr);

    let cmake = new CMakeTests("random");
    let files = cmake.cppFilesForExecutable("/vscode-qttest/test/qt_test/build-dev/test1", codemodelJson);
    if (files.length != 1) {
        console.error("Expected 1 file, got " + files.length);
        process.exit(1);
    }

    let expected = "/vscode-qttest/test/qt_test/test1.cpp";
    let got = files[0].replace(/\\/g, "/");

    if (got != expected) {
        console.error("Expected " + expected + ", got " + got);
        process.exit(1);
    }

    let targetName = cmake.targetNameForExecutable("/vscode-qttest/test/qt_test/build-dev/test1", codemodelJson);
    if (targetName != "test1") {
        console.error("Expected test1, got " + targetName);
        process.exit(1);
    }

    // test windows back slashes:

    files = cmake.cppFilesForExecutable("/vscode-qttest/test/qt_test/build-dev/test2", codemodelJson);
    if (files.length != 1) {
        console.error("Expected 1 file, got " + files.length);
        process.exit(1);
    }

    targetName = cmake.targetNameForExecutable("/vscode-qttest/test/qt_test/build-dev/test2", codemodelJson);
    if (targetName != "test2") {
        console.error("Expected test2, got " + targetName);
        process.exit(1);
    }

}

runTests("test/qt_test/build-dev/");
runCodeModelTests("test/test_cmake_codemodel.json");
