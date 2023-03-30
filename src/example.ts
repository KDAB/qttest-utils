// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

import { CMakeTests, CMakeTest } from "./cmake";
import { QtTest, QtTests } from "./qttest";
import fs from 'fs';
import { exec } from "child_process";

async function example() {
    const args = process.argv.slice(2)
    if (args.length != 1) {
        console.error("ERROR: Expected a single argument with the build-dir with cmake tests!");
        process.exit(2);
    }

    let buildDirPath = args[0];

    if (!fs.existsSync(buildDirPath)) {
        console.error('Directory does not exist!');
        process.exit(1);
    }

    let qt = new QtTests();

    // Gather all tests that would be executed by CTest:
    await qt.discoverViaCMake(buildDirPath);

    // Filter-out the ones that don't link to QtTest (doctests and such)
    await qt.removeNonLinking();

    // Example of filtering out by regexp:
    qt.removeMatching(/(tst_view|tst_window)/);

    // Uncomment to see example of filtering out by regexp (inverted):
    // qt.maintainMatching(/(tst_docks|tst_qtwidgets|tst_multisplitter)/);

    qt.dumpExecutablePaths();
    await qt.dumpTestSlots();

    console.log("\nRunning tests...");
    for (var executable of qt.qtTestExecutables) {
        await executable.runTest();
        if (executable.lastExitCode === 0)
            console.log("    PASS: " + executable.filename);
        else
            console.log("    FAIL: " + executable.filename + "; code=" + executable.lastExitCode);
        for (let slot of executable.slots!) {
            if (slot.lastTestFailure) {
                console.log("        failed slot=" + slot.name + "; path=" + slot.lastTestFailure.filePath + "; line=" + slot.lastTestFailure.lineNumber);
            }
        }
    }

    // Also run individual slots, just for example purposes:

    console.log("\nRunning single tests...");
    let slot = qt.qtTestExecutables[1].slots![0];
    await slot.runTest();
    if (slot.lastTestFailure)
        console.log("    FAIL:" + JSON.stringify(slot.lastTestFailure));
    else
        console.log("    PASS:");

    let slot2 = qt.qtTestExecutables[1].slots![2];
    await slot2.runTest();
    if (slot2.lastTestFailure)
        console.log("    FAIL:" + JSON.stringify(slot2.lastTestFailure));
    else
        console.log("    PASS");

}

example();
