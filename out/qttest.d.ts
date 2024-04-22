type LoggerFunction = (arg: string) => void;
export declare function logMessage(message: string): void;
/**
 * Represents a single QtTest executable.
 * Supports listing the individual test slots
 */
export declare class QtTest {
    readonly filename: string;
    readonly buildDirPath: string;
    verbose: boolean;
    vscodeTestItem: any | undefined;
    slots: QtTestSlot[] | null;
    lastExitCode: number;
    constructor(filename: string, buildDirPath: string);
    get id(): string;
    get label(): string;
    relativeFilename(): string;
    filenameWithoutExtension(): string;
    /**
     * Calls "./yourqttest -functions" and stores the results in the slots property.
     */
    parseAvailableSlots(): Promise<void>;
    /**
     * Returns whether this executable links to libQtTest.so.
     *
     * Useful for Qt autodetection, as some tests are doctest or so.
     *
     * Only implemented for Linux. Returns undefined on other platforms.
     */
    linksToQtTestLib(): Promise<boolean> | undefined;
    isQtTestViaHelp(): Promise<boolean | undefined>;
    slotByName(name: string): QtTestSlot | undefined;
    runTest(slot?: QtTestSlot, cwd?: string): Promise<boolean>;
    tapOutputFileName(slot?: QtTestSlot): string;
    txtOutputFileName(slot?: QtTestSlot): string;
    command(): {
        label: string;
        executablePath: string;
        args: string[];
    };
    clearSubTestStates(): void;
    updateSubTestStates(cwdDir: string, slot?: QtTestSlot): Promise<void>;
}
/**
 * Represents a single Qt test slot
 */
export declare class QtTestSlot {
    name: string;
    parentQTest: QtTest;
    vscodeTestItem: any | undefined;
    lastTestFailure: TestFailure | undefined;
    constructor(name: string, parent: QtTest);
    get id(): string;
    get absoluteFilePath(): string;
    runTest(): Promise<boolean>;
    command(): {
        label: string;
        executablePath: string;
        args: string[];
    };
}
/**
 * Represents the list of all QtTest executables in your project
 */
export declare class QtTests {
    qtTestExecutables: QtTest[];
    discoverViaCMake(buildDirPath: string): Promise<void>;
    removeNonLinking(): Promise<void>;
    setLogFunction(func: LoggerFunction): void;
    removeByRunningHelp(): Promise<void>;
    removeMatching(regex: RegExp): void;
    maintainMatching(regex: RegExp): void;
    dumpExecutablePaths(): void;
    dumpTestSlots(): Promise<void>;
    executablesContainingSlot(slotName: string): QtTest[];
}
export interface TestFailure {
    name: string;
    filePath: string;
    lineNumber: number;
}
export {};
