// src/lexer/lexer.ts

import { Token, TokenType, keywords } from "./token.ts";
import { LexerError } from "./errors.ts";

/**
 * The Lexer class takes source code as input and converts it into a stream of tokens.
 * It handles identifying different types of lexical units, skipping whitespace and comments,
 * and reporting errors for unrecognized characters.
 */
export class Lexer {
    private input: string;
    private currentPosition: number = 0;      // Current position in the input string
    private nextPosition: number = 0;  // Next reading position (after current char)
    private character: string = '';         // Current character being examined
    private currentLine: number = 1;
    private currentColumn: number = 0;

    /**
     * Initializes the lexer with the given source code.
     * @param input The source code string.
     */
    constructor(input: string) {
        this.input = input;
        this.readCharacter(); // Start by reading the first character
    }

    /**
     * Reads the next character from the input and advances the `position` and `readPosition`.
     * If at the end of the input, sets `char` to an empty string.
     */
    private readCharacter(): void {
        if (this.character === '\n') { // If the character just read was a newline
            this.currentLine++;
            this.currentColumn = 1; // Reset column for new line
        } else {
            this.currentColumn++; // Increment column for regular characters
        }

        if (this.nextPosition >= this.input.length) {
            this.character = ''; // End of file
        } else {
            this.character = this.input[this.nextPosition];
        }
        this.currentPosition = this.nextPosition;
        this.nextPosition++;
    }

    /**
     * Peeks at the next character in the input without advancing the lexer's position.
     * @returns The next character, or '' if at EOF.
     */
    private peekChar(): string {
        if (this.nextPosition >= this.input.length) {
            return '';
        }
        return this.input[this.nextPosition];
    }

    /**
     * Skips over any whitespace characters (space, tab, newline, carriage return).
     * The lexer doesn't tokenize whitespace; it just skips it.
     */
    private skipWhitespace(): void {
        while (this.character === ' ' || this.character === '\t' || this.character === '\r') {
            this.readCharacter();
        }
    }

    /**
     * Reads a sequence of digits to form an INTEGER or FLOAT token.
     * It checks for a single decimal point to determine if it's a float.
     * @returns The string representation of the number.
     */
    private readNumber(): string {
        const startPosition = this.currentPosition;

        // Read integer part
        while (this.isDigit(this.character)) {
            this.readCharacter();
        }

        // Check for fractional part (decimal point followed by digits)
        // Ensure it's a '.' AND that there's a digit AFTER the '.'
        if (this.character === '.' && this.isDigit(this.peekChar())) {
            this.readCharacter(); // Consume the '.'
            // Read fractional part
            while (this.isDigit(this.character)) {
                this.readCharacter();
            }
        }

        return this.input.substring(startPosition, this.currentPosition);
    }

    /**
     * Checks if a character is a digit (0-9).
     * @param char The character to check.
     * @returns True if it's a digit, false otherwise.
     */
    private isDigit(char: string): boolean {
        return char >= '0' && char <= '9';
    }

    /**
     * The core function of the lexer: returns the next token from the input.
     * @returns The next Token object.
     */
    nextToken(): Token {
        this.skipWhitespace(); // Always skip whitespace before trying to read a token

        let token: Token;
        const tokenLine = this.currentLine; // Capture line before reading the character
        const tokenColumn = this.currentColumn; // Capture column before reading the character

        switch (this.character) {
            case '+':
                token = { type: TokenType.PLUS, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '+' character
                break;
            case '': // This means we've reached the end of the input
                token = { type: TokenType.EOF, literal: "", line: tokenLine, column: tokenColumn };
                break;
            default:
                if (this.isDigit(this.character)) {
                    // If it's a digit, read the whole number (integer or float)
                    // The line and column for numbers are determined by where the number starts.
                    // The readNumber method handles advancing the character, so we use
                    // the captured `tokenLine` and `tokenColumn` which represent the start.
                    const literal = this.readNumber();
                    // Determine if it's an INTEGER or FLOAT based on whether it contained a '.'
                    token = {
                        type: literal.includes('.') ? TokenType.FLOAT : TokenType.INTEGER,
                        literal,
                        line: tokenLine,
                        column: tokenColumn // Column of the first digit
                    };
                } else {
                    // Any other character is unrecognized
                    token = { type: TokenType.ILLEGAL, literal: this.character, line: tokenLine, column: tokenColumn };
                    this.readCharacter(); // Consume the illegal character to move past it
                }
                break;
        }
        return token;
    }
}
