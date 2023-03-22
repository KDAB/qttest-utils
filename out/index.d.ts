import { CMakeTests, CMakeTest } from "./cmake";
import { QtTests, QtTest, QtTestSlot } from "./qttest";
declare const qttest: {
    QtTests: typeof QtTests;
    QtTest: typeof QtTest;
    QtTestSlot: typeof QtTestSlot;
    CMakeTests: typeof CMakeTests;
    CMakeTest: typeof CMakeTest;
};
export default qttest;
