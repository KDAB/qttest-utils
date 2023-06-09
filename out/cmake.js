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
