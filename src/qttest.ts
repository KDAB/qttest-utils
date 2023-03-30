// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

import { spawn } from "child_process";
import path from "path";
import * as fs from 'fs';
import { CMakeTests } from "./cmake";

/**
 * Represents a single QtTest executable.
 * Supports listing the individual test slots
 */
export class QtTest {
    readonly filename: string;
    readonly buildDirPath: string;

    /// Allows vscode extensions to associate with a test item
    vscodeTestItem: any | undefined;

    slots: QtTestSlot[] | null = null;

    constructor(filename: string, buildDirPath: string) {
        this.filename = filename;
        this.buildDirPath = buildDirPath;
    }

    public get id() {
        return this.filename;
    }

    public get label() {
        return path.basename(this.filename);
    }

    /**
     * Calls "./yourqttest -functions" and stores the results in the slots property.
     */
    public async parseAvailableSlots(): Promise<void> {
        let slotNames: string[] = [];
        let output = "";
        let err = "";

        await new Promise((resolve, reject) => {
            if (!fs.existsSync(this.filename)) {
                reject(new Error("File doesn't exit: " + this.filename));
                return;
            }

            const child = spawn(this.filename, ["-functions"], { cwd: this.buildDirPath });

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
                } else {
                    reject(new Error("Failed to run -functions, stdout=" + output + "; stderr=" + err + "; code=" + code));
                }
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
    public linksToQtTestLib(): Promise<boolean> | undefined {

        let isLinux = process.platform === "linux";
        if (!isLinux) { return undefined; }

        return new Promise((resolve, reject) => {
            const child = spawn("ldd", [this.filename]);
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
                } else {
                    reject(new Error("Failed to run ldd"));
                }
            });
        });
    }

    /// Returns whether this test is a QtTest by running it with -help and checking if the help text looks familiar
    /// Note that if this is not a QtTest it might not run help and instead execute the test itself
    public async isQtTestViaHelp(): Promise<boolean | undefined> {
        return await new Promise((resolve, reject) => {
            const child = spawn(this.filename, ["-help"]);
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
                } else {
                    resolve(false);
                }
            });
        });
    }

    /// Runs this test
    public async runTest(slotName?: string, cwd: string = ""): Promise<boolean> {
        let args: string[] = [];
        if (slotName) {
            // Runs a single Qt test instead
            args = args.concat(slotName);
        }

        return await new Promise((resolve, reject) => {
            let opts = cwd.length > 0 ? { cwd: cwd } : { cwd: this.buildDirPath };
            const child = spawn(this.filename, args, opts);
            child.stdout.on("data", (chunk) => {
                // chunk.toString()
            });

            child.on("exit", (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    public command(): { label: string, executablePath: string, args: string[] } {
        return { label: this.label, executablePath: this.filename, args: [] };
    }
}

/**
 * Represents a single Qt test slot
 */
export class QtTestSlot {
    name: string;

    // The QTest executable this slot belongs to
    parentQTest: QtTest;

    /// Allows vscode extensions to associate with a test item
    vscodeTestItem: any | undefined;

    constructor(name: string, parent: QtTest) {
        this.name = name;
        this.parentQTest = parent;
    }

    public get id() {
        return this.parentQTest.filename + this.name;
    }

    public get absoluteFilePath() {
        return this.parentQTest.filename;
    }

    public async runTest(): Promise<boolean> {
        return this.parentQTest.runTest(this.name);
    }

    public command(): { label: string, executablePath: string, args: string[] } {
        return { label: this.name, executablePath: this.absoluteFilePath, args: [this.name] };
    }
}

/**
 * Represents the list of all QtTest executables in your project
 */
export class QtTests {
    qtTestExecutables: QtTest[] = [];

    async discoverViaCMake(buildDirPath: string) {
        var cmake = new CMakeTests(buildDirPath);
        let ctests = await cmake.tests();
        if (ctests) {
            for (let ctest of ctests) {
                let qtest = new QtTest(ctest.executablePath(), buildDirPath);
                this.qtTestExecutables.push(qtest);
            }
        } else {
            console.error("Failed to retrieve ctests!");
        }
    }

    /// Removes any executable (from the list) that doesn't link to libQtTest.so
    /// This heuristic tries to filter-out doctest and other non-Qt tests
    /// Only implemented for linux for now
    public async removeNonLinking() {
        let isLinux = process.platform === "linux";
        if (!isLinux) { return; }

        let acceptedExecutables: QtTest[] = [];
        for (let ex of this.qtTestExecutables) {
            let linksToQt = await ex.linksToQtTestLib();
            // undefined or true is accepted
            if (linksToQt !== false) {
                acceptedExecutables.push(ex);
            }
            this.qtTestExecutables = acceptedExecutables;
        }
    }

    public async removeByRunningHelp() {
        this.qtTestExecutables = this.qtTestExecutables.filter(async (ex) => await ex.isQtTestViaHelp());
    }

    /// Removes any executable (from the list) that matches the specified regex
    public removeMatching(regex: RegExp) {
        this.qtTestExecutables = this.qtTestExecutables.filter((ex) => !regex.test(ex.filename));
    }

    /// Removes any executable (from the list) that doesn't match the specified regex
    public maintainMatching(regex: RegExp) {
        this.qtTestExecutables = this.qtTestExecutables.filter((ex) => regex.test(ex.filename));
    }

    public dumpExecutablePaths() {
        for (var ex of this.qtTestExecutables) {
            console.log(ex.filename);
        }
    }

    public async dumpTestSlots() {
        for (var ex of this.qtTestExecutables) {
            if (!ex.slots)
                await ex.parseAvailableSlots();

            console.log(ex.filename);
            if (ex.slots) {
                for (let slot of ex.slots) {
                    console.log("    - " + slot.name);
                }
            }
        }
    }
}
