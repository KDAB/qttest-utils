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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
/// Returns whether the specified file is an executable
function isExecutable(filePath) {
    if (process.platform === "win32") {
        return path_1.default.extname(filePath).toLocaleLowerCase() === ".exe";
    }
    else {
        try {
            fs.accessSync(filePath, fs.constants.X_OK);
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
/// Returns whether the specified file is a library
function isLibrary(filename) {
    const split = filename.split(".");
    if (split.length <= 1) {
        return false;
    }
    // Find the first non-numeric extension, so we ignore all the trailing numbers in libFoo.so.2.0.9
    for (var i = split.length - 1; i >= 0; --i) {
        const extension = split[i];
        const isNumber = !isNaN(Number(extension));
        if (isNumber) {
            continue;
        }
        return ["so", "dll", "dylib"].includes(extension);
    }
    return false;
}
/// Recursively looks for executable files in folderPath
function executableFiles(folderPath) {
    const files = fs.readdirSync(folderPath);
    var executables = [];
    for (var file of files) {
        // Ignore CMakeFiles directory, it has some of binaries
        if (path_1.default.basename(file) === "CMakeFiles") {
            continue;
        }
        const childPath = path_1.default.join(folderPath, file);
        const info = fs.statSync(childPath);
        if (info.isDirectory()) {
            executables = executables.concat(executableFiles(childPath));
        }
        else if (info.isFile() && !isLibrary(path_1.default.basename(childPath)) && isExecutable(childPath)) {
            executables.push(childPath);
        }
    }
    return executables;
}
