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
        // Gather all tests that would be executed by CTest:
        yield qt.discoverViaCMake(buildDirPath);
        // Filter-out the ones that don't link to QtTest (doctests and such)
        yield qt.removeNonLinking();
        // Example of filtering out by regexp:
        qt.removeMatching(/(tst_view|tst_window)/);
        // Example of filtering out by regexp (inverted):
        qt.maintainMatching(/(tst_docks|tst_qtwidgets|tst_multisplitter)/);
        qt.dumpExecutablePaths();
        qt.dumpTestSlots();
    });
}
example();
