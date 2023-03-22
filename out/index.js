"use strict";
// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT
Object.defineProperty(exports, "__esModule", { value: true });
const cmake_1 = require("./cmake");
const qttest_1 = require("./qttest");
const qttest = {
    QtTests: qttest_1.QtTests, QtTest: qttest_1.QtTest, QtTestSlot: qttest_1.QtTestSlot, CMakeTests: cmake_1.CMakeTests, CMakeTest: cmake_1.CMakeTest
};
exports.default = qttest;
