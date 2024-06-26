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
exports.QtTests = exports.QtTestSlot = exports.QtTest = exports.logMessage = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const cmake_1 = require("./cmake");
const tap_parser_1 = require("tap-parser");
var gLogFunction;
function logMessage(message) {
    if (gLogFunction) {
        gLogFunction(message);
    }
}
exports.logMessage = logMessage;
/**
 * Represents a single QtTest executable.
 * Supports listing the individual test slots
 */
class QtTest {
    constructor(filename, buildDirPath) {
        /// If true, will print more verbose output
        this.verbose = false;
        /// The list of individual runnable test slots
        this.slots = null;
        /// Set after running
        this.lastExitCode = 0;
        /// Allows the caller to receive the output of the test process
        this.outputFunc = undefined;
        this.filename = filename;
        this.buildDirPath = buildDirPath;
    }
    get id() {
        return this.filename;
    }
    get label() {
        return path_1.default.basename(this.filename);
    }
    relativeFilename() {
        let result = path_1.default.relative(process.cwd(), this.filename);
        // strip .exe, as we only use this for tests
        if (result.endsWith(".exe"))
            result = result.slice(0, -4);
        // normalize slashes
        result = result.replace(/\\/g, "/");
        return result;
    }
    /// returns filename without .exe extension
    filenameWithoutExtension() {
        let result = this.filename;
        if (result.endsWith(".exe"))
            result = result.slice(0, -4);
        return result;
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
                    reject(new Error("qttest: File doesn't exit: " + this.filename));
                    return;
                }
                const child = (0, child_process_1.spawn)(this.filename, ["-functions"], {
                    cwd: this.buildDirPath,
                });
                child.stdout.on("data", (chunk) => {
                    output += chunk.toString();
                });
                child.stderr.on("data", (chunk) => {
                    err += chunk.toString();
                });
                child.on("exit", (code) => {
                    if (code === 0) {
                        slotNames = slotNames.concat(output.split("\n"));
                        slotNames = slotNames.map((entry) => entry.trim().replace("()", ""));
                        slotNames = slotNames.filter((entry) => entry.length > 0);
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
                        reject(new Error("qttest: Failed to run -functions, stdout=" +
                            output +
                            "; stderr=" +
                            err +
                            "; code=" +
                            code));
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
            if (this.verbose)
                logMessage("qttest: Running ldd on " + this.filename);
            const child = (0, child_process_1.spawn)("ldd", [this.filename]);
            let output = "";
            let result = false;
            child.stdout.on("data", (chunk) => {
                if (!result) {
                    if (chunk.toString().includes("libQt5Test.so") ||
                        chunk.toString().includes("libQt6Test.so")) {
                        result = true;
                    }
                }
                if (this.verbose)
                    logMessage(chunk.toString());
            });
            child.on("exit", (code) => {
                if (code === 0) {
                    resolve(result);
                }
                else {
                    reject(new Error("qttest: Failed to run ldd"));
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
    slotByName(name) {
        if (!this.slots)
            return undefined;
        for (let slot of this.slots) {
            if (slot.name == name)
                return slot;
        }
        return undefined;
    }
    /// Runs this test
    runTest(slot_1) {
        return __awaiter(this, arguments, void 0, function* (slot, cwd = "") {
            let args = [];
            if (slot) {
                // Runs a single Qt test instead
                args = args.concat(slot.name);
            }
            else {
                this.clearSubTestStates();
            }
            // log to file and to stdout
            args = args.concat("-o").concat(this.tapOutputFileName(slot) + ",tap");
            args = args.concat("-o").concat(this.txtOutputFileName(slot) + ",txt");
            args = args.concat("-o").concat("-,txt");
            return yield new Promise((resolve, reject) => {
                let cwdDir = cwd.length > 0 ? cwd : this.buildDirPath;
                logMessage("Running " +
                    this.filename +
                    " " +
                    args.join(" ") +
                    " with cwd=" +
                    cwdDir);
                const child = (0, child_process_1.spawn)(this.filename, args, { cwd: cwdDir });
                if (this.outputFunc) {
                    // Callers wants the process output:
                    child.stdout.on("data", (chunk) => {
                        if (this.outputFunc)
                            this.outputFunc(chunk.toString());
                    });
                    child.stderr.on("data", (chunk) => {
                        if (this.outputFunc)
                            this.outputFunc(chunk.toString());
                    });
                }
                child.on("exit", (code) => __awaiter(this, void 0, void 0, function* () {
                    /// Can code even be null ?
                    if (code == undefined)
                        code = -1;
                    if (!slot) {
                        this.lastExitCode = code;
                    }
                    if (this.slots && this.slots.length > 0) {
                        /// When running a QtTest executable, let's check which sub-tests failed
                        /// (So VSCode can show some error icon for each fail)
                        try {
                            yield this.updateSubTestStates(cwdDir, slot);
                        }
                        catch (e) {
                            logMessage("Failed to update sub-test states: " + e);
                        }
                    }
                    if (code === 0) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }));
            });
        });
    }
    /// Using .tap so we don't have to use a separate XML library
    /// .tap is plain text and a single regexp can catch the failing tests and line number
    tapOutputFileName(slot) {
        let slotName = slot ? "_" + slot.name : "";
        return this.label + slotName + ".tap";
    }
    txtOutputFileName(slot) {
        let slotName = slot ? "_" + slot.name : "";
        return this.label + slotName + ".txt";
    }
    command() {
        return { label: this.label, executablePath: this.filename, args: [] };
    }
    clearSubTestStates() {
        if (this.slots) {
            for (let slot of this.slots) {
                slot.lastTestFailure = undefined;
            }
        }
    }
    updateSubTestStates(cwdDir, slot) {
        return __awaiter(this, void 0, void 0, function* () {
            let tapFileName = cwdDir + "/" + this.tapOutputFileName(slot);
            var failures = yield new Promise((resolve, reject) => {
                fs.readFile(tapFileName, "utf8", (error, data) => {
                    if (error) {
                        logMessage("ERROR: Failed to read log file");
                        reject(error);
                    }
                    else {
                        let failedResults = [];
                        try {
                            const tap_events = tap_parser_1.Parser.parse(data);
                            for (let event of tap_events) {
                                try {
                                    if (event.length < 2)
                                        continue;
                                    if (event.at(0) != "assert")
                                        continue;
                                    var obj = event.at(1);
                                    let pass = obj["ok"] === true;
                                    let xfail = !pass && obj["todo"] !== false;
                                    if (xfail) {
                                        // This is a QEXPECT_FAIL test, all good.
                                        // QtTest outputs it as "todo"
                                        continue;
                                    }
                                    // There's an QEXPECT_FAIL but test passed, not good.
                                    let xpass = pass && obj["todo"].includes("returned TRUE unexpectedly");
                                    if (!pass || xpass) {
                                        // We found a failure
                                        var name = obj["name"].replace(/\(.*\)/, "");
                                        var filename = "";
                                        var lineNumber = -1;
                                        if (obj["diag"]) {
                                            filename = obj["diag"]["file"];
                                            lineNumber = obj["diag"]["line"];
                                        }
                                        else {
                                            // A XPASS for example misses file:line info. Nothing we can do, it's a Qt bug arguably.
                                        }
                                        failedResults.push({
                                            name: name,
                                            filePath: filename,
                                            lineNumber: lineNumber,
                                        });
                                    }
                                }
                                catch (e) { }
                            }
                        }
                        catch (e) { }
                        resolve(failedResults);
                    }
                });
            });
            for (let failure of failures) {
                if (slot && slot.name != failure.name) {
                    // We executed a single slot, ignore anything else
                    continue;
                }
                let failedSlot = this.slotByName(failure.name);
                if (failedSlot) {
                    failedSlot.lastTestFailure = failure;
                }
                else {
                    logMessage("ERROR: Failed to find slot with name " + failure.name);
                }
            }
        });
    }
}
exports.QtTest = QtTest;
/**
 * Represents a single Qt test slot
 */
class QtTestSlot {
    constructor(name, parent) {
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
        return {
            label: this.name,
            executablePath: this.absoluteFilePath,
            args: [this.name],
        };
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
                logMessage("ERROR: Failed to retrieve ctests!");
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
    setLogFunction(func) {
        gLogFunction = func;
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
    /// Returns all executables that contain a Qt test slot with the specified name
    executablesContainingSlot(slotName) {
        let result = [];
        for (let ex of this.qtTestExecutables) {
            if (ex.slotByName(slotName)) {
                result.push(ex);
            }
        }
        return result;
    }
}
exports.QtTests = QtTests;
