// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

import { spawn } from "child_process";
import path from "path";
import { logMessage } from "./qttest";

/**
 * Represents tests added in cmake (Via add_test())
 * 
 * Contains methods to discover Qt Tests via CMake
 */
export class CMakeTests {
    // The build dir where we'll run 
    readonly buildDirPath: string;

    constructor(buildDirPath: string) {
        this.buildDirPath = buildDirPath;
    }

    /**
     * Invokes ctest.exe --show-only=json-v1
     * 
     * @returns a promise with the list of tests
     */
    public async tests(): Promise<CMakeTest[] | undefined> {

        // TODO: Check if folder exists
        if (this.buildDirPath.length == 0) {
            console.error("Could not find out cmake build dir");
            return undefined;
        }

        return new Promise((resolve, reject) => {
            logMessage("Running ctest --show-only=json-v1 with cwd=" + this.buildDirPath);
            const child = spawn("ctest", ["--show-only=json-v1"], { "cwd": this.buildDirPath });
            let output = "";
            child.stdout.on("data", (chunk) => {
                output += chunk.toString();
            });

            child.on("exit", (code) => {
                if (code === 0) {
                    resolve(this.ctestJsonToList(output));
                } else {
                    reject(new Error("Failed to run ctest"));
                }
            });

            return undefined;
        });
    }

    private ctestJsonToList(json: string): CMakeTest[] {

        let allJSON = JSON.parse(json);

        if (!("tests" in allJSON)) { return []; }

        let tests: CMakeTest[] = allJSON.tests.map((testJSON: any) => {
            let test = new CMakeTest();
            test.command = testJSON.command;
            test.cwd = testJSON.cwd;
            return test;
        });

        return tests;
    }
}


/// Represents an inividual CTest test
export class CMakeTest {
    public command: string[] = [];
    public cwd: string = "";

    public id(): string {
        return this.command.join(",");
    }

    public label(): string {
        return path.basename(this.executablePath());
    }

    public executablePath(): string {
        return this.command[0];
    }
}