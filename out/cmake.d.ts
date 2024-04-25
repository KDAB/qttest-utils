/**
 * Represents tests added in cmake (Via add_test())
 *
 * Contains methods to discover Qt Tests via CMake
 */
export declare class CMakeTests {
    readonly buildDirPath: string;
    constructor(buildDirPath: string);
    /**
     * Invokes ctest.exe --show-only=json-v1
     *
     * @returns a promise with the list of tests
     */
    tests(): Promise<CMakeTest[] | undefined>;
    private ctestJsonToList;
    targetNameForExecutable(executable: string, codemodel: any, workaround?: boolean): string | undefined;
    filenamesAreEqual(file1: string, file2: string, workaround?: boolean): boolean;
    cppFilesForExecutable(executable: string, codemodel: any, workaround?: boolean): string[];
}
export declare class CMakeTest {
    command: string[];
    cwd: string;
    id(): string;
    label(): string;
    executablePath(): string;
}
