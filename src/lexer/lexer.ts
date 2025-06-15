// src/lexer/lexer.ts

import { Token, TokenType, KeywordInfo } from "./token.ts";
import { base_keywords, qzq_keywords, trk_keywords } from "./keywords.ts";
import { LexerError } from "./errors.ts";

/**
 * The Lexer class takes source code as input and converts it into a stream of tokens.
 * It handles identifying different types of lexical units, skipping whitespace and comments,
 * and reporting errors for unrecognized characters.
 */
export class Lexer {
    input: string;
    currentPosition: number;        // current position in input (points to this.character)
    nextPosition: number;    // current reading position in input (after this.character)
    character: string;       // current char under examination
    currentLine: number;
    currentColumn: number;

    keywords: { [key: string]: KeywordInfo }; // Change Array to a more specific type if possible

    /**
     * Initializes the lexer with the given source code.
     * @param input The source code string.
     */
    constructor(input: string, keywords: { [key: string]: KeywordInfo } = base_keywords) {
        this.input = input;
        this.currentPosition = -1; // Initialize before the first character
        this.nextPosition = 0; // Points to the first character to be read
        this.character = ''; // Will be set by the initial readCharacter()
        this.currentLine = 1;
        this.currentColumn = 1; // Column before the first character on the line
        this.keywords = keywords
        this.readCharacter(); // Call once to set initial this.character and update line/column
    }

    /**
     * Reads the next character from the input and advances the `position` and `nextPosition`.
     * If at the end of the input, sets `char` to an empty string.
     */
    private readCharacter(): void {
        // First, check if the *current* character was a newline to update line/column for the *next* character.
        // This ensures currentLine/currentColumn reflect the position of this.character *after* it's set.
        if (this.character === '\n') {
            this.currentLine++;
            this.currentColumn = 1; // New line starts at column 1
        } else if (this.character !== '') { // Only increment column for non-EOF characters
            this.currentColumn++;
        }

        // Now, read the next character from the input
        if (this.nextPosition >= this.input.length) {
            this.character = ''; // End of file
        } else {
            this.character = this.input[this.nextPosition];
        }

        this.currentPosition = this.nextPosition; // Update current position
        this.nextPosition++; // Move nextPosition forward

        // Handle initial column for the very first character if starting at column 0.
        // Or, better, ensure the constructor calls readCharacter once to properly set the initial state.
        if (this.currentPosition === 0 && this.currentColumn === 0 && this.character !== '\n') {
             this.currentColumn = 1; // Special handling for the very first character
        }
    }

    /**
     * Peeks at the next character in the input without advancing the lexer's position.
     * @returns The next character, or '' if at EOF.
     */
    private peekCharacter(): string {
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

    // --- UTF-8 compatible isLetter implementation ---
    isLetter(char: string): boolean {
        // This is the most straightforward way to check for letters, including
        // most Unicode letters, using JavaScript's regex capabilities.
        // \p{L} matches any kind of letter from any language.
        // The 'u' flag is essential for Unicode support.
        return /\p{L}/u.test(char);
    }

    isDigit(char: string): boolean {
        // \p{N} matches any kind of numeric character in any script.
        // \p{Nd} specifically matches decimal digits (0-9 in various scripts).
        // For typical programming languages, '0'-'9' is usually sufficient.
        return /\p{Nd}/u.test(char); // More robust for Unicode digits
        // return '0' <= char && char <= '9'; // Standard ASCII digit check
    }

    // Helper to check if a character is part of an identifier
    isIdentCharacter(char: string): boolean {
        // An identifier can start with a letter or underscore, and contain letters, digits, or underscores.
        return this.isLetter(char) || this.isDigit(char) || char === '_';
    }


    readIdentifier(): string {
        const startPosition = this.currentPosition;
        // Continue reading as long as the current character is an identifier character
        while (this.character !== '' && this.isIdentCharacter(this.character)) {
            this.readCharacter();
        }
        return this.input.substring(startPosition, this.currentPosition);
    }

    readNumber(): string {
        const startPosition = this.currentPosition;
        // Continue reading digits
        while (this.character !== '' && this.isDigit(this.character)) {
            this.readCharacter();
        }
        // Handle floating-point numbers
        if (this.character === '.' && this.isDigit(this.peekCharacter())) {
            this.readCharacter(); // Consume the '.'
            // Read fractional part
            while (this.isDigit(this.character)) {
                this.readCharacter();
            }
        }
        return this.input.substring(startPosition, this.currentPosition);
    }

    /**
     * This method now returns a KeywordInfo object or null if not a keyword.
     * @param literal The string identified as a potential keyword.
     * @returns KeywordInfo if it's a keyword, otherwise null.
     */
    lookupKeyword(literal: string): KeywordInfo | undefined {
        return this.keywords[literal];
    }

    /**
     * Reads a string literal, including handling the opening and closing quotes.
     * Assumes the current character is the opening quote (e.g., '"').
     * The literal value will be the content between the quotes.
     * @returns The string content (without quotes) or an empty string if unclosed.
     */
    readString(): string {
        const startPosition = this.currentPosition + 1; // Start *after* the opening quote
        let isClosed = false;

        this.readCharacter(); // Consume the opening '"'

        while (this.character !== '' && this.character !== '"') {
            // Basic handling for escape sequences (e.g., \" to include a quote)
            // You might want a more sophisticated escape sequence parser later.
            if (this.character === '\\' && this.peekCharacter() === '"') {
                this.readCharacter(); // Consume '\'
                this.readCharacter(); // Consume '"'
            } else {
                this.readCharacter();
            }
        }

        // Check if the string was properly closed
        if (this.character === '"') {
            isClosed = true;
        }

        const literalContent = this.input.substring(startPosition, this.currentPosition);

        this.readCharacter(); // Consume the closing '"' (or the character that broke the loop if unclosed)

        // You might want to store whether the string was closed or not on the token itself
        // or throw an error immediately if unclosed. For now, we'll just return the literal.
        if (!isClosed) {
            // In a real lexer, you'd likely report a LexerError for an unclosed string.
            // For simplicity here, we'll just return what we read.
            // throw new LexerError("Unclosed string literal", this.currentLine, startPosition);
            console.warn(`Lexer Warning: Unclosed string literal at Line ${this.currentLine}, Column ${startPosition}`);
        }

        return literalContent;
    }
    
    /**
     * The core function of the lexer: returns the next token from the input.
     * @returns The next Token object.
     */
    nextToken(): Token {
        this.skipWhitespace(); // Always skip whitespace before trying to read a token

        // Capture line and column *before* processing the current character,
        // as these represent the start of the token.
        const tokenLine = this.currentLine;
        const tokenColumn = this.currentColumn;

        let token: Token;

        switch (this.character) {
            case '\n':
                token = { type: TokenType.NEWLINE, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the newline
                break;
            case '~':
                token = { type: TokenType.TILDE, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the newline
                break;
            case '"':
                const stringLiteral = this.readString();
                token = { type: TokenType.STRING, literal: stringLiteral, line: tokenLine, column: tokenColumn };
                break;
            case '=': {
                let tokenType = TokenType.ASSIGN;
                let literal = this.character; // Capture the first '='

                if (this.peekCharacter() == '=') {
                    tokenType = TokenType.EQ;
                    literal += this.peekCharacter(); // Append the second '='
                    this.readCharacter(); // Consume the second '='
                }
                token = { type: tokenType, literal: literal, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the character *after* the full token
                break;
            }
            case '+':
                token = { type: TokenType.PLUS, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '+'
                break;
            case '-':
                token = { type: TokenType.MINUS, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '-'
                break;
            case '!': {
                let tokenType = TokenType.BANG;
                let literal = this.character; // Capture the '!'

                if (this.peekCharacter() == '=') {
                    tokenType = TokenType.NOT_EQ;
                    literal += this.peekCharacter(); // Append the '='
                    this.readCharacter(); // Consume the '='
                }
                token = { type: tokenType, literal: literal, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the character *after* the full token
                break;
            }
            case '*':
                token = { type: TokenType.ASTERISK, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '*'
                break;
            case '/':
                token = { type: TokenType.SLASH, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case '<': {
                let tokenType = TokenType.LT;
                let literal = this.character; // Capture the '<'

                if (this.peekCharacter() == '=') {
                    tokenType = TokenType.LTE;
                    literal += this.peekCharacter(); // Append the '='
                    this.readCharacter(); // Consume the '='
                }
                token = { type: tokenType, literal: literal, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the character *after* the full token
                break;
            }
            case '>': {
                let tokenType = TokenType.GT; // Corrected from TokenType.PLUS in previous snippet
                let literal = this.character; // Capture the '>'

                if (this.peekCharacter() == '=') {
                    tokenType = TokenType.GTE;
                    literal += this.peekCharacter(); // Append the '='
                    this.readCharacter(); // Consume the '='
                }
                token = { type: tokenType, literal: literal, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the character *after* the full token
                break;
            }
            case ',':
                token = { type: TokenType.COMMA, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case '(':
                token = { type: TokenType.LPAREN, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case ')':
                token = { type: TokenType.RPAREN, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case '{':
                token = { type: TokenType.LBRACE, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case '}':
                token = { type: TokenType.RBRACE, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case '[':
                token = { type: TokenType.LBRACKET, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case ']':
                token = { type: TokenType.RBRACKET, literal: this.character, line: tokenLine, column: tokenColumn };
                this.readCharacter(); // Consume the '/'
                break;
            case '': // End of file
                token = { type: TokenType.EOF, literal: "", line: tokenLine, column: tokenColumn };
                // No readCharacter() here, as we are already at EOF
                break;
            default:
                if (this.isDigit(this.character)) {
                    // readNumber() is assumed to advance this.character internally
                    const literal = this.readNumber();
                    token = {
                        type: literal.includes('.') ? TokenType.FLOAT : TokenType.INTEGER,
                        literal,
                        line: tokenLine, // Use the captured tokenLine
                        column: tokenColumn // Use the captured tokenColumn (start of number)
                    };
                } else if (this.isLetter(this.character)) {
                    const foundLiteral = this.readIdentifier(); // Read the full identifier string
                    const keywordInfo = this.lookupKeyword(foundLiteral); // Check if it's a keyword
                    if (keywordInfo) {
                        // If it's a keyword, use its TokenType and the unified baseLiteral
                        token = {
                            type: keywordInfo.type,
                            literal: keywordInfo.baseLiteral, // Use the unified literal here!
                            line: tokenLine,
                            column: tokenColumn
                        };
                    } else {
                        // It's a regular identifier, use the foundLiteral directly
                        token = {
                            type: TokenType.IDENTIFIER,
                            literal: foundLiteral,
                            line: tokenLine,
                            column: tokenColumn
                        };
                    }
                } else {
                    // Handle unexpected characters
                    token = { type: TokenType.ILLEGAL, literal: this.character, line: tokenLine, column: tokenColumn };
                    this.readCharacter(); // Consume the illegal character
                }
                break;
        }
        return token;
    }
}
