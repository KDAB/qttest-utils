// SPDX-FileCopyrightText: 2023 Klarälvdalens Datakonsult AB, a KDAB Group company <info@kdab.com>
// Author: Sergio Martins <sergio.martins@kdab.com>
// SPDX-License-Identifier: MIT

import { CMakeTests, CMakeTest } from "./cmake";
import { QtTests, QtTest, QtTestSlot } from "./qttest";

const qttest = {
    QtTests, QtTest, QtTestSlot, CMakeTests, CMakeTest
};

export default qttest;
