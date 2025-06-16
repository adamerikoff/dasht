// src/parser/errors.ts

/**
 * Custom error class for parsing errors.
 * Extends the built-in Error to include line and column information.
 */
export class ParserError extends Error {
    /** The line number where the error occurred. */
    line: number;
    /** The column number where the error occurred. */
    column: number;

    /**
     * Creates an instance of ParserError.
     * @param message A descriptive error message.
     * @param line The 1-based line number in the source code where the error was detected.
     * @param column The 1-based column number in the source code where the error was detected.
     */
    constructor(message: string, line: number, column: number) {
        // Call the parent Error constructor
        super(message);

        // Set the name of the error for easier identification
        this.name = "ParserError";

        // Store the line and column number
        this.line = line;
        this.column = column;

        // Maintain proper stack trace for V8 (Node.js/Deno)
        // This is important for debugging as it prevents the constructor call from appearing in the stack.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ParserError);
        }
    }
}