"use strict";
// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.QtTests = exports.QtTestSlot = exports.QtTest = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const cmake_1 = require("./cmake");
/**
 * Represents a single QtTest executable.
 * Supports listing the individual test slots
 */
class QtTest {
    constructor(filename, buildDirPath) {
        /// The list of individual runnable test slots
        this.slots = null;
        /// Set after running
        this.lastExitCode = 0;
        this.filename = filename;
        this.buildDirPath = buildDirPath;
    }
    get id() {
        return this.filename;
    }
    get label() {
        return path_1.default.basename(this.filename);
    }
    /**
     * Calls "./yourqttest -functions" and stores the results in the slots property.
     */
    parseAvailableSlots() {
        return __awaiter(this, void 0, void 0, function* () {
            let slotNames = [];
            let output = "";
            let err = "";
            yield new Promise((resolve, reject) => {
                if (!fs.existsSync(this.filename)) {
                    reject(new Error("File doesn't exit: " + this.filename));
                    return;
                }
                const child = (0, child_process_1.spawn)(this.filename, ["-functions"], { cwd: this.buildDirPath });
                child.stdout.on("data", (chunk) => {
                    output += chunk.toString();
                });
                child.stderr.on("data", (chunk) => {
                    err += chunk.toString();
                });
                child.on("exit", (code) => {
                    if (code === 0) {
                        slotNames = slotNames.concat(output.split("\n"));
                        slotNames = slotNames.map(entry => entry.trim().replace("()", ""));
                        slotNames = slotNames.filter(entry => entry.length > 0);
                        if (slotNames.length > 0) {
                            this.slots = [];
                            for (var slotName of slotNames) {
                                var slot = new QtTestSlot(slotName, this);
                                this.slots.push(slot);
                            }
                        }
                        resolve(slotNames);
                    }
                    else {
                        reject(new Error("Failed to run -functions, stdout=" + output + "; stderr=" + err + "; code=" + code));
                    }
                });
            });
        });
    }
    /**
     * Returns whether this executable links to libQtTest.so.
     *
     * Useful for Qt autodetection, as some tests are doctest or so.
     *
     * Only implemented for Linux. Returns undefined on other platforms.
     */
    linksToQtTestLib() {
        let isLinux = process.platform === "linux";
        if (!isLinux) {
            return undefined;
        }
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)("ldd", [this.filename]);
            let output = "";
            let result = false;
            child.stdout.on("data", (chunk) => {
                if (!result) {
                    if (chunk.toString().includes("libQt5Test.so") || chunk.toString().includes("libQt6Test.so")) {
                        result = true;
                    }
                }
            });
            child.on("exit", (code) => {
                if (code === 0) {
                    resolve(result);
                }
                else {
                    reject(new Error("Failed to run ldd"));
                }
            });
        });
    }
    /// Returns whether this test is a QtTest by running it with -help and checking if the help text looks familiar
    /// Note that if this is not a QtTest it might not run help and instead execute the test itself
    isQtTestViaHelp() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const child = (0, child_process_1.spawn)(this.filename, ["-help"]);
                let output = "";
                let result = false;
                child.stdout.on("data", (chunk) => {
                    if (!result) {
                        if (chunk.toString().includes("[testfunction[:testdata]]")) {
                            result = true;
                        }
                    }
                });
                child.on("exit", (code) => {
                    if (code === 0) {
                        resolve(result);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        });
    }
    /// Runs this test
    runTest(slot, cwd = "") {
        return __awaiter(this, void 0, void 0, function* () {
            let args = [];
            if (slot) {
                // Runs a single Qt test instead
                args = args.concat(slot.name);
            }
            return yield new Promise((resolve, reject) => {
                let opts = cwd.length > 0 ? { cwd: cwd } : { cwd: this.buildDirPath };
                const child = (0, child_process_1.spawn)(this.filename, args, opts);
                child.stdout.on("data", (chunk) => {
                    // chunk.toString()
                });
                child.on("exit", (code) => {
                    /// We can code even be null ?
                    if (code == undefined)
                        code = -1;
                    if (slot) {
                        slot.lastExitCode = code;
                    }
                    else {
                        this.lastExitCode = code;
                    }
                    if (code === 0) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            });
        });
    }
    command() {
        return { label: this.label, executablePath: this.filename, args: [] };
    }
}
exports.QtTest = QtTest;
/**
 * Represents a single Qt test slot
 */
class QtTestSlot {
    constructor(name, parent) {
        /// Set after running
        this.lastExitCode = 0;
        this.name = name;
        this.parentQTest = parent;
    }
    get id() {
        return this.parentQTest.filename + this.name;
    }
    get absoluteFilePath() {
        return this.parentQTest.filename;
    }
    runTest() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parentQTest.runTest(this);
        });
    }
    command() {
        return { label: this.name, executablePath: this.absoluteFilePath, args: [this.name] };
    }
}
exports.QtTestSlot = QtTestSlot;
/**
 * Represents the list of all QtTest executables in your project
 */
class QtTests {
    constructor() {
        this.qtTestExecutables = [];
    }
    discoverViaCMake(buildDirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var cmake = new cmake_1.CMakeTests(buildDirPath);
            let ctests = yield cmake.tests();
            if (ctests) {
                for (let ctest of ctests) {
                    let qtest = new QtTest(ctest.executablePath(), buildDirPath);
                    this.qtTestExecutables.push(qtest);
                }
            }
            else {
                console.error("Failed to retrieve ctests!");
            }
        });
    }
    /// Removes any executable (from the list) that doesn't link to libQtTest.so
    /// This heuristic tries to filter-out doctest and other non-Qt tests
    /// Only implemented for linux for now
    removeNonLinking() {
        return __awaiter(this, void 0, void 0, function* () {
            let isLinux = process.platform === "linux";
            if (!isLinux) {
                return;
            }
            let acceptedExecutables = [];
            for (let ex of this.qtTestExecutables) {
                let linksToQt = yield ex.linksToQtTestLib();
                // undefined or true is accepted
                if (linksToQt !== false) {
                    acceptedExecutables.push(ex);
                }
                this.qtTestExecutables = acceptedExecutables;
            }
        });
    }
    removeByRunningHelp() {
        return __awaiter(this, void 0, void 0, function* () {
            this.qtTestExecutables = this.qtTestExecutables.filter((ex) => __awaiter(this, void 0, void 0, function* () { return yield ex.isQtTestViaHelp(); }));
        });
    }
    /// Removes any executable (from the list) that matches the specified regex
    removeMatching(regex) {
        this.qtTestExecutables = this.qtTestExecutables.filter((ex) => !regex.test(ex.filename));
    }
    /// Removes any executable (from the list) that doesn't match the specified regex
    maintainMatching(regex) {
        this.qtTestExecutables = this.qtTestExecutables.filter((ex) => regex.test(ex.filename));
    }
    dumpExecutablePaths() {
        for (var ex of this.qtTestExecutables) {
            console.log(ex.filename);
        }
    }
    dumpTestSlots() {
        return __awaiter(this, void 0, void 0, function* () {
            for (var ex of this.qtTestExecutables) {
                if (!ex.slots)
                    yield ex.parseAvailableSlots();
                console.log(ex.filename);
                if (ex.slots) {
                    for (let slot of ex.slots) {
                        console.log("    - " + slot.name);
                    }
                }
            }
        });
    }
}
exports.QtTests = QtTests;
