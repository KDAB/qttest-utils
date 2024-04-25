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
exports.CMakeTest = exports.CMakeTests = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const qttest_1 = require("./qttest");
/**
 * Represents tests added in cmake (Via add_test())
 *
 * Contains methods to discover Qt Tests via CMake
 */
class CMakeTests {
    constructor(buildDirPath) {
        this.buildDirPath = buildDirPath;
    }
    /**
     * Invokes ctest.exe --show-only=json-v1
     *
     * @returns a promise with the list of tests
     */
    tests() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Check if folder exists
            if (this.buildDirPath.length == 0) {
                console.error("Could not find out cmake build dir");
                return undefined;
            }
            return new Promise((resolve, reject) => {
                (0, qttest_1.logMessage)("Running ctest --show-only=json-v1 with cwd=" + this.buildDirPath);
                const child = (0, child_process_1.spawn)("ctest", ["--show-only=json-v1"], { "cwd": this.buildDirPath });
                let output = "";
                child.stdout.on("data", (chunk) => {
                    output += chunk.toString();
                });
                child.on("exit", (code) => {
                    if (code === 0) {
                        resolve(this.ctestJsonToList(output));
                    }
                    else {
                        reject(new Error("Failed to run ctest"));
                    }
                });
                return undefined;
            });
        });
    }
    ctestJsonToList(json) {
        let allJSON = JSON.parse(json);
        if (!("tests" in allJSON)) {
            return [];
        }
        let tests = allJSON.tests.map((testJSON) => {
            let test = new CMakeTest();
            test.command = testJSON.command;
            test.cwd = testJSON.cwd;
            return test;
        });
        return tests;
    }
    /// Returns the cmake target name for the specified executable
    /// codemodel should have a "projects" key at root.
    targetNameForExecutable(executable, codemodel) {
        // simplify:
        if (executable.endsWith(".exe")) {
            executable = executable.substring(0, executable.length - 4);
        }
        // replace backslashes with forward slashes
        executable = executable.replace(/\\/g, "/");
        let projects = codemodel["projects"];
        if (!projects)
            return undefined;
        for (let project of projects) {
            let targets = project["targets"];
            if (!targets)
                continue;
            for (let target of targets) {
                let artifacts = target["artifacts"];
                if (!artifacts)
                    continue;
                for (let artifact of artifacts) {
                    if (artifact.endsWith(".exe")) {
                        artifact = artifact.substring(0, artifact.length - 4);
                    }
                    // replace backslashes with forward slashes
                    artifact = artifact.replace(/\\/g, "/");
                    if (artifact == executable) {
                        let name = target["name"];
                        if (name) {
                            // We found the target name
                            return name;
                        }
                    }
                }
            }
        }
        return undefined;
    }
    /// Returns the list of .cpp files for the specified executable
    /// codemodel is the CMake codemodel JSON object
    /// codemodel should have a "projects" key at root.
    cppFilesForExecutable(executable, codemodel) {
        // simplify:
        if (executable.endsWith(".exe")) {
            executable = executable.substring(0, executable.length - 4);
        }
        // replace backslashes with forward slashes
        executable = executable.replace(/\\/g, "/");
        let projects = codemodel["projects"];
        if (!projects)
            return [];
        for (let project of projects) {
            let targets = project["targets"];
            if (!targets)
                continue;
            for (let target of targets) {
                let sourceDir = target["sourceDirectory"];
                let artifacts = target["artifacts"];
                if (!artifacts || !sourceDir)
                    continue;
                let targetType = target["type"];
                if (targetType != "EXECUTABLE")
                    continue;
                for (let artifact of artifacts) {
                    if (artifact.endsWith(".exe")) {
                        artifact = artifact.substring(0, artifact.length - 4);
                    }
                    // replace backslashes with forward slashes
                    artifact = artifact.replace(/\\/g, "/");
                    if (artifact == executable) {
                        let fileGroups = target["fileGroups"];
                        if (!fileGroups)
                            continue;
                        for (let fileGroup of fileGroups) {
                            if (fileGroup["language"] != "CXX" || fileGroup["isGenerated"])
                                continue;
                            let sources = fileGroup["sources"];
                            if (!sources)
                                continue;
                            let cppFiles = [];
                            for (let source of sources) {
                                if (!source.endsWith("mocs_compilation.cpp")) {
                                    cppFiles.push(path_1.default.join(sourceDir, source));
                                }
                            }
                            return cppFiles;
                        }
                    }
                }
            }
        }
        (0, qttest_1.logMessage)("cppFilesForExecutable: Could not find cpp files for executable " + executable);
        return [];
    }
}
exports.CMakeTests = CMakeTests;
/// Represents an inividual CTest test
class CMakeTest {
    constructor() {
        this.command = [];
        this.cwd = "";
    }
    id() {
        return this.command.join(",");
    }
    label() {
        return path_1.default.basename(this.executablePath());
    }
    executablePath() {
        return this.command[0];
    }
}
exports.CMakeTest = CMakeTest;
