"use strict";
// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qttest_1 = require("./qttest");
const fs_1 = __importDefault(require("fs"));
function example() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length != 1) {
            console.error("ERROR: Expected a single argument with the build-dir with cmake tests!");
            process.exit(2);
        }
        let buildDirPath = args[0];
        if (!fs_1.default.existsSync(buildDirPath)) {
            console.error('Directory does not exist!');
            process.exit(1);
        }
        let qt = new qttest_1.QtTests();
        qt.setLogFunction((message) => {
            console.log(message);
        });
        // Gather all tests that would be executed by CTest:
        yield qt.discoverViaCMake(buildDirPath);
        // Filter-out the ones that don't link to QtTest (doctests and such)
        yield qt.removeNonLinking();
        // Example of filtering out by regexp:
        qt.removeMatching(/(tst_view|tst_window)/);
        // Uncomment to see example of filtering out by regexp (inverted):
        // qt.maintainMatching(/(tst_docks|tst_qtwidgets|tst_multisplitter)/);
        qt.dumpExecutablePaths();
        yield qt.dumpTestSlots();
        console.log("\nRunning tests...");
        for (var executable of qt.qtTestExecutables) {
            yield executable.runTest();
            if (executable.lastExitCode === 0)
                console.log("    PASS: " + executable.filename);
            else
                console.log("    FAIL: " + executable.filename + "; code=" + executable.lastExitCode);
            for (let slot of executable.slots) {
                if (slot.lastTestFailure) {
                    console.log("        failed slot=" + slot.name + "; path=" + slot.lastTestFailure.filePath + "; line=" + slot.lastTestFailure.lineNumber);
                }
                else {
                    console.log("        pass: " + slot.name);
                }
            }
        }
        // Also run individual slots, just for example purposes:
        console.log("\nRunning single tests...");
        let slot = qt.qtTestExecutables[1].slots[0];
        yield slot.runTest();
        if (slot.lastTestFailure)
            console.log("    FAIL:" + JSON.stringify(slot.lastTestFailure));
        else
            console.log("    PASS:");
        let slot2 = qt.qtTestExecutables[1].slots[2];
        yield slot2.runTest();
        if (slot2.lastTestFailure)
            console.log("    FAIL:" + JSON.stringify(slot2.lastTestFailure));
        else
            console.log("    PASS");
    });
}
example();
