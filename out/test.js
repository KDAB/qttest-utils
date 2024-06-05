"use strict";
// SPDX-FileCopyrightText: 2024 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cmake_1 = require("./cmake");
const qttest_1 = require("./qttest");
// Be sure to build the Qt tests with CMake first
// See .github/workflows/ci.yml
function runTests(buildDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let qt = new qttest_1.QtTests();
        yield qt.discoverViaCMake(buildDirPath);
        let expected_executables = [
            "test/qt_test/build-dev/test1",
            "test/qt_test/build-dev/test2",
            "test/qt_test/build-dev/test3",
            "test/qt_test/build-dev/non_qttest",
        ];
        if (qt.qtTestExecutables.length != expected_executables.length) {
            console.error("Expected 3 executables, got " + qt.qtTestExecutables.length);
            process.exit(1);
        }
        yield qt.removeNonLinking();
        /// On macOS and Windows we don't have ldd or equivalent, so we can't check if the test links to QtTest
        /// Use the help way instead
        yield qt.removeByRunningHelp();
        /// Remove the non-qttest executable from qt.qtTestExecutables
        qt.qtTestExecutables = qt.qtTestExecutables.filter((e) => !e.filenameWithoutExtension().endsWith("non_qttest"));
        if (qt.qtTestExecutables.length != 3) {
            console.error("Expected 3 executables, at this point got " +
                qt.qtTestExecutables.length);
            process.exit(1);
        }
        // 1. Test that the executable test names are correct:
        var i = 0;
        for (var executable of qt.qtTestExecutables) {
            let expected = expected_executables[i];
            if (executable.relativeFilename() != expected) {
                console.error("Expected executable " +
                    expected +
                    ", got " +
                    executable.relativeFilename());
                process.exit(1);
            }
            i++;
        }
        // 2. Test that the discovered slots are correct:
        yield qt.dumpTestSlots();
        let expected_slots = {
            "test/qt_test/build-dev/test1": ["testA", "testB", "testC", "testXFAIL"],
            "test/qt_test/build-dev/test2": ["testD", "testE", "testF"],
            "test/qt_test/build-dev/test3": ["testAbortsEverythig", "testH", "testI"],
        };
        for (var executable of qt.qtTestExecutables) {
            var i = 0;
            for (let slot of executable.slots) {
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
            yield executable.runTest();
            let wasSuccess = executable.lastExitCode === 0;
            if (wasSuccess && !expected_success[i]) {
                console.error("Expected test to fail: " + executable.filename);
                process.exit(1);
            }
            else if (!wasSuccess && expected_success[i]) {
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
        let slot = qt.qtTestExecutables[0].slots[0];
        yield slot.runTest();
        if (slot.lastTestFailure) {
            console.error("Expected test to pass: " + slot.name);
            process.exit(1);
        }
        let slot2 = qt.qtTestExecutables[1].slots[2];
        yield slot2.runTest();
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
        // 6. Run a slot that has XFAIL
        slot = qt.qtTestExecutables[0].slots[3];
        // assert it's called testXFAIL
        if (slot.name != "testXFAIL") {
            console.error("Expected slot name to be testXFAIL");
            process.exit(1);
        }
        yield slot.runTest();
        if (slot.lastTestFailure) {
            console.error("Expected test to pass: " + slot.name);
            process.exit(1);
        }
    });
}
function runCodeModelTests(codeModelFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const fs = require("fs");
        let codemodelStr = fs.readFileSync(codeModelFile, "utf8");
        let codemodelJson = JSON.parse(codemodelStr);
        let cmake = new cmake_1.CMakeTests("random");
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
        // test workaround for microsoft/vscode-cmake-tools-api/issues/7
        files = cmake.cppFilesForExecutable("/vscode-qttest/test/qt_test/build-dev/test3", codemodelJson, 
        /*workaround=*/ false);
        if (files.length !== 0) {
            console.error("Expected 0 files, got " + files.length);
            process.exit(1);
        }
        files = cmake.cppFilesForExecutable("/vscode-qttest/test/qt_test/build-dev/test3", codemodelJson, 
        /*workaround=*/ true);
        if (files.length !== 1) {
            console.error("Expected 0 files, got " + files.length);
            process.exit(1);
        }
        targetName = cmake.targetNameForExecutable("/vscode-qttest/test/qt_test/build-dev/test3", codemodelJson, 
        /*workaround=*/ false);
        if (targetName) {
            console.error("Expected null, got " + targetName);
            process.exit(1);
        }
        targetName = cmake.targetNameForExecutable("/vscode-qttest/test/qt_test/build-dev/test3", codemodelJson, 
        /*workaround=*/ true);
        if (targetName != "test3") {
            console.error("Expected null, got " + targetName);
            process.exit(1);
        }
    });
}
function runNonQtTest(buildDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let qt = new qttest_1.QtTests();
        yield qt.discoverViaCMake(buildDirPath);
        var nonQtExecutable = undefined;
        for (let executable of qt.qtTestExecutables) {
            if (executable.filenameWithoutExtension().endsWith("non_qttest")) {
                nonQtExecutable = executable;
                break;
            }
        }
        if (nonQtExecutable === undefined) {
            console.error("Expected to find non-Qt test executable");
            process.exit(1);
        }
        yield nonQtExecutable.runTest();
    });
}
runTests("test/qt_test/build-dev/");
runNonQtTest("test/qt_test/build-dev/");
runCodeModelTests("test/test_cmake_codemodel.json");
