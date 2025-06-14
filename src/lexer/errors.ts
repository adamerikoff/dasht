// src/lexer/errors.ts

/**
 * Custom error class for lexical analysis errors.
 * Includes line and column information to pinpoint the error location.
 */
export class LexerError extends Error {
    line: number;
    column: number;

    constructor(message: string, line: number, column: number) {
        super(`Lexer Error at line ${line}, column ${column}: ${message}`);
        this.name = "LexerError";
        this.line = line;
        this.column = column;
    }
}
