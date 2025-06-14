// tests/lexer_test.ts

import { assertEquals } from "@std/assert";
import { Lexer, Token, TokenType } from "../../src/lexer/mod.ts";

Deno.test("Lexer: handles basic operators and EOF", () => {
    const input = `+`;
    const expectedTokens: Token[] = [
        { type: TokenType.PLUS, literal: "+", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type}, got ${actualToken.type} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}'`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles integers", () => {
    const input = `12345`;
    const expectedTokens: Token[] = [
        { type: TokenType.INTEGER, literal: "12345", line: 1, column: 0 },
        { type: TokenType.EOF, literal: "", line: 1, column: 5 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles floats", () => {
    const input = `12.345`;
    const expectedTokens: Token[] = [
        { type: TokenType.FLOAT, literal: "12.345", line: 1, column: 0 },
        { type: TokenType.EOF, literal: "", line: 1, column: 6 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles integers and floats combined with whitespace", () => {
    const input = `123 45.67 89`;
    const expectedTokens: Token[] = [
        { type: TokenType.INTEGER, literal: "123", line: 1, column: 0 },
        { type: TokenType.FLOAT, literal: "45.67", line: 1, column: 4 },
        { type: TokenType.INTEGER, literal: "89", line: 1, column: 10 },
        { type: TokenType.EOF, literal: "", line: 1, column: 12 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles illegal characters", () => {
    const input = `~^&`;
    const expectedTokens: Token[] = [
        { type: TokenType.ILLEGAL, literal: "~", line: 1, column: 0 },
        { type: TokenType.ILLEGAL, literal: "^", line: 1, column: 1 },
        { type: TokenType.ILLEGAL, literal: "&", line: 1, column: 2 },
        { type: TokenType.EOF, literal: "", line: 1, column: 3 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: skips whitespace", () => {
    const input = `   123   +   45.67   `;
    const expectedTokens: Token[] = [
        { type: TokenType.INTEGER, literal: "123", line: 1, column: 3 },
        { type: TokenType.PLUS, literal: "+", line: 1, column: 9 },
        { type: TokenType.FLOAT, literal: "45.67", line: 1, column: 13 },
        { type: TokenType.EOF, literal: "", line: 1, column: 21 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles multiple token types in sequence", () => {
    const input = `let five = 5;
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    };

    let result = add(five, ten);
    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
        return true;
    } else {
        return false;
    }

    10 == 10;
    10 != 9;
    "hello world"
    "foo bar"
    [1, 2];
    {"foo": "bar"};
    for while and or elsif
    `;
    const expectedTokens: Token[] = [
        { type: TokenType.LET, literal: "let", line: 1, column: 0 },
        { type: TokenType.IDENTIFIER, literal: "five", line: 1, column: 4 },
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 9 },
        { type: TokenType.INTEGER, literal: "5", line: 1, column: 11 },
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 12 },

        { type: TokenType.LET, literal: "let", line: 1, column: 4 },
        { type: TokenType.IDENTIFIER, literal: "ten", line: 1, column: 8 },
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 12 },
        { type: TokenType.INTEGER, literal: "10", line: 1, column: 14 },
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 16 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 0 },

        { type: TokenType.LET, literal: "let", line: 3, column: 4 },
        { type: TokenType.IDENTIFIER, literal: "add", line: 3, column: 8 },
        { type: TokenType.ASSIGN, literal: "=", line: 3, column: 12 },
        { type: TokenType.FUNCTION, literal: "fn", line: 3, column: 14 },
        { type: TokenType.LPAREN, literal: "(", line: 3, column: 16 },
        { type: TokenType.IDENTIFIER, literal: "x", line: 3, column: 17 },
        { type: TokenType.COMMA, literal: ",", line: 3, column: 18 },
        { type: TokenType.IDENTIFIER, literal: "y", line: 3, column: 20 },
        { type: TokenType.RPAREN, literal: ")", line: 3, column: 21 },
        { type: TokenType.LBRACE, literal: "{", line: 3, column: 23 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 24 },

        { type: TokenType.IDENTIFIER, literal: "x", line: 4, column: 6 },
        { type: TokenType.PLUS, literal: "+", line: 4, column: 8 },
        { type: TokenType.IDENTIFIER, literal: "y", line: 4, column: 10 },
        { type: TokenType.ILLEGAL, literal: ";", line: 4, column: 11 }, // Assuming ; is ILLEGAL for now, or add to Token.
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 12 },

        { type: TokenType.RBRACE, literal: "}", line: 5, column: 4 },
        { type: TokenType.ILLEGAL, literal: ";", line: 5, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 5, column: 6 },
        { type: TokenType.NEWLINE, literal: "\n", line: 6, column: 0 },

        { type: TokenType.LET, literal: "let", line: 7, column: 4 },
        { type: TokenType.IDENTIFIER, literal: "result", line: 7, column: 8 },
        { type: TokenType.ASSIGN, literal: "=", line: 7, column: 15 },
        { type: TokenType.IDENTIFIER, literal: "add", line: 7, column: 17 },
        { type: TokenType.LPAREN, literal: "(", line: 7, column: 20 },
        { type: TokenType.IDENTIFIER, literal: "five", line: 7, column: 21 },
        { type: TokenType.COMMA, literal: ",", line: 7, column: 25 },
        { type: TokenType.IDENTIFIER, literal: "ten", line: 7, column: 27 },
        { type: TokenType.RPAREN, literal: ")", line: 7, column: 30 },
        { type: TokenType.ILLEGAL, literal: ";", line: 7, column: 31 },
        { type: TokenType.NEWLINE, literal: "\n", line: 7, column: 32 },

        { type: TokenType.BANG, literal: "!", line: 8, column: 4 },
        { type: TokenType.MINUS, literal: "-", line: 8, column: 5 },
        { type: TokenType.SLASH, literal: "/", line: 8, column: 6 },
        { type: TokenType.ASTERISK, literal: "*", line: 8, column: 7 },
        { type: TokenType.INTEGER, literal: "5", line: 8, column: 8 },
        { type: TokenType.ILLEGAL, literal: ";", line: 8, column: 9 },
        { type: TokenType.NEWLINE, literal: "\n", line: 8, column: 10 },

        { type: TokenType.INTEGER, literal: "5", line: 9, column: 4 },
        { type: TokenType.LT, literal: "<", line: 9, column: 6 },
        { type: TokenType.INTEGER, literal: "10", line: 9, column: 8 },
        { type: TokenType.GT, literal: ">", line: 9, column: 11 },
        { type: TokenType.INTEGER, literal: "5", line: 9, column: 13 },
        { type: TokenType.ILLEGAL, literal: ";", line: 9, column: 14 },
        { type: TokenType.NEWLINE, literal: "\n", line: 9, column: 15 },
        { type: TokenType.NEWLINE, literal: "\n", line: 10, column: 0 },

        { type: TokenType.IF, literal: "if", line: 11, column: 4 },
        { type: TokenType.LPAREN, literal: "(", line: 11, column: 7 },
        { type: TokenType.INTEGER, literal: "5", line: 11, column: 8 },
        { type: TokenType.LT, literal: "<", line: 11, column: 10 },
        { type: TokenType.INTEGER, literal: "10", line: 11, column: 12 },
        { type: TokenType.RPAREN, literal: ")", line: 11, column: 14 },
        { type: TokenType.LBRACE, literal: "{", line: 11, column: 16 },
        { type: TokenType.NEWLINE, literal: "\n", line: 11, column: 17 },

        { type: TokenType.RETURN, literal: "return", line: 12, column: 8 },
        { type: TokenType.TRUE, literal: "true", line: 12, column: 15 },
        { type: TokenType.ILLEGAL, literal: ";", line: 12, column: 19 },
        { type: TokenType.NEWLINE, literal: "\n", line: 12, column: 20 },

        { type: TokenType.RBRACE, literal: "}", line: 13, column: 4 },
        { type: TokenType.ELSE, literal: "else", line: 13, column: 6 },
        { type: TokenType.LBRACE, literal: "{", line: 13, column: 11 },
        { type: TokenType.NEWLINE, literal: "\n", line: 13, column: 12 },

        { type: TokenType.RETURN, literal: "return", line: 14, column: 8 },
        { type: TokenType.FALSE, literal: "false", line: 14, column: 15 },
        { type: TokenType.ILLEGAL, literal: ";", line: 14, column: 20 },
        { type: TokenType.NEWLINE, literal: "\n", line: 14, column: 21 },

        { type: TokenType.RBRACE, literal: "}", line: 15, column: 4 },
        { type: TokenType.NEWLINE, literal: "\n", line: 15, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 16, column: 0 },

        { type: TokenType.INTEGER, literal: "10", line: 17, column: 4 },
        { type: TokenType.EQ, literal: "==", line: 17, column: 7 },
        { type: TokenType.INTEGER, literal: "10", line: 17, column: 10 },
        { type: TokenType.ILLEGAL, literal: ";", line: 17, column: 12 },
        { type: TokenType.NEWLINE, literal: "\n", line: 17, column: 13 },

        { type: TokenType.INTEGER, literal: "10", line: 18, column: 4 },
        { type: TokenType.NOT_EQ, literal: "!=", line: 18, column: 7 },
        { type: TokenType.INTEGER, literal: "9", line: 18, column: 10 },
        { type: TokenType.ILLEGAL, literal: ";", line: 18, column: 11 },
        { type: TokenType.NEWLINE, literal: "\n", line: 18, column: 12 },

        { type: TokenType.STRING, literal: "hello world", line: 19, column: 4 },
        { type: TokenType.NEWLINE, literal: "\n", line: 19, column: 18 },

        { type: TokenType.STRING, literal: "foo bar", line: 20, column: 4 },
        { type: TokenType.NEWLINE, literal: "\n", line: 20, column: 14 },

        { type: TokenType.LBRACKET, literal: "[", line: 21, column: 4 },
        { type: TokenType.INTEGER, literal: "1", line: 21, column: 5 },
        { type: TokenType.COMMA, literal: ",", line: 21, column: 6 },
        { type: TokenType.INTEGER, literal: "2", line: 21, column: 8 },
        { type: TokenType.RBRACKET, literal: "]", line: 21, column: 9 },
        { type: TokenType.ILLEGAL, literal: ";", line: 21, column: 10 },
        { type: TokenType.NEWLINE, literal: "\n", line: 21, column: 11 },

        { type: TokenType.LBRACE, literal: "{", line: 22, column: 4 },
        { type: TokenType.STRING, literal: "foo", line: 22, column: 5 },
        { type: TokenType.ILLEGAL, literal: ":", line: 22, column: 10 }, // Assuming : is ILLEGAL, or add to Token
        { type: TokenType.STRING, literal: "bar", line: 22, column: 12 },
        { type: TokenType.RBRACE, literal: "}", line: 22, column: 17 },
        { type: TokenType.ILLEGAL, literal: ";", line: 22, column: 18 },
        { type: TokenType.NEWLINE, literal: "\n", line: 22, column: 19 },

        { type: TokenType.FOR, literal: "for", line: 23, column: 4 },
        { type: TokenType.WHILE, literal: "while", line: 23, column: 8 },
        { type: TokenType.AND, literal: "and", line: 23, column: 14 },
        { type: TokenType.OR, literal: "or", line: 23, column: 18 },
        { type: TokenType.ELSIF, literal: "elsif", line: 23, column: 21 },
        { type: TokenType.NEWLINE, literal: "\n", line: 23, column: 26 },
        { type: TokenType.EOF, literal: "", line: 24, column: 0 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Input: "${input.substring(actualToken.column, actualToken.column + actualToken.literal.length)}", Expected type ${expectedToken.type}, got ${actualToken.type} for literal '${expectedToken.literal}' at line ${actualToken.line}, column ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Input: "${input.substring(actualToken.column, actualToken.column + actualToken.literal.length)}", Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, column ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Input: "${input.substring(actualToken.column, actualToken.column + actualToken.literal.length)}", Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Input: "${input.substring(actualToken.column, actualToken.column + actualToken.literal.length)}", Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});


Deno.test("Lexer: handles identifiers and keywords", () => {
    const input = `let my_var = 10; fn add(a, b) { return a + b; } if true else false elsif and or for while`;
    const expectedTokens: Token[] = [
        { type: TokenType.LET, literal: "let", line: 1, column: 0 },
        { type: TokenType.IDENTIFIER, literal: "my_var", line: 1, column: 4 },
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 11 },
        { type: TokenType.INTEGER, literal: "10", line: 1, column: 13 },
        { type: TokenType.ILLEGAL, literal: ";", line: 1, column: 15 },
        { type: TokenType.FUNCTION, literal: "fn", line: 1, column: 17 },
        { type: TokenType.IDENTIFIER, literal: "add", line: 1, column: 20 },
        { type: TokenType.LPAREN, literal: "(", line: 1, column: 23 },
        { type: TokenType.IDENTIFIER, literal: "a", line: 1, column: 24 },
        { type: TokenType.COMMA, literal: ",", line: 1, column: 25 },
        { type: TokenType.IDENTIFIER, literal: "b", line: 1, column: 27 },
        { type: TokenType.RPAREN, literal: ")", line: 1, column: 28 },
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 30 },
        { type: TokenType.RETURN, literal: "return", line: 1, column: 32 },
        { type: TokenType.IDENTIFIER, literal: "a", line: 1, column: 39 },
        { type: TokenType.PLUS, literal: "+", line: 1, column: 41 },
        { type: TokenType.IDENTIFIER, literal: "b", line: 1, column: 43 },
        { type: TokenType.ILLEGAL, literal: ";", line: 1, column: 44 },
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 46 },
        { type: TokenType.IF, literal: "if", line: 1, column: 48 },
        { type: TokenType.TRUE, literal: "true", line: 1, column: 51 },
        { type: TokenType.ELSE, literal: "else", line: 1, column: 56 },
        { type: TokenType.FALSE, literal: "false", line: 1, column: 61 },
        { type: TokenType.ELSIF, literal: "elsif", line: 1, column: 67 },
        { type: TokenType.AND, literal: "and", line: 1, column: 73 },
        { type: TokenType.OR, literal: "or", line: 1, column: 77 },
        { type: TokenType.FOR, literal: "for", line: 1, column: 80 },
        { type: TokenType.WHILE, literal: "while", line: 1, column: 84 },
        { type: TokenType.EOF, literal: "", line: 1, column: 89 },
    ];
    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type}, got ${actualToken.type} for literal '${expectedToken.literal}' at line ${actualToken.line}, column ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, column ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles all operators", () => {
    const input = `+-!*/<>==!=`;
    const expectedTokens: Token[] = [
        { type: TokenType.PLUS, literal: "+", line: 1, column: 0 },
        { type: TokenType.MINUS, literal: "-", line: 1, column: 1 },
        { type: TokenType.BANG, literal: "!", line: 1, column: 2 },
        { type: TokenType.ASTERISK, literal: "*", line: 1, column: 3 },
        { type: TokenType.SLASH, literal: "/", line: 1, column: 4 },
        { type: TokenType.LT, literal: "<", line: 1, column: 5 },
        { type: TokenType.GT, literal: ">", line: 1, column: 6 },
        { type: TokenType.EQ, literal: "==", line: 1, column: 7 },
        { type: TokenType.NOT_EQ, literal: "!=", line: 1, column: 9 },
        { type: TokenType.EOF, literal: "", line: 1, column: 11 },
    ];
    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles all delimiters", () => {
    const input = `(),{}[]`;
    const expectedTokens: Token[] = [
        { type: TokenType.LPAREN, literal: "(", line: 1, column: 0 },
        { type: TokenType.RPAREN, literal: ")", line: 1, column: 1 },
        { type: TokenType.COMMA, literal: ",", line: 1, column: 2 },
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 3 },
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 4 },
        { type: TokenType.LBRACKET, literal: "[", line: 1, column: 5 },
        { type: TokenType.RBRACKET, literal: "]", line: 1, column: 6 },
        { type: TokenType.EOF, literal: "", line: 1, column: 7 },
    ];
    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles strings", () => {
    const input = `"hello world" "another string"`;
    const expectedTokens: Token[] = [
        { type: TokenType.STRING, literal: "hello world", line: 1, column: 0 },
        { type: TokenType.STRING, literal: "another string", line: 1, column: 14 },
        { type: TokenType.EOF, literal: "", line: 1, column: 30 },
    ];
    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});

Deno.test("Lexer: handles newlines", () => {
    const input = `line1\nline2\r\nline3`;
    const expectedTokens: Token[] = [
        { type: TokenType.IDENTIFIER, literal: "line1", line: 1, column: 0 },
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 5 },
        { type: TokenType.IDENTIFIER, literal: "line2", line: 1, column: 0 },
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 5 }, // \r\n should be treated as a single newline token. The literal depends on your `readCharacter` handling.
        { type: TokenType.IDENTIFIER, literal: "line3", line: 2, column: 0 },
        { type: TokenType.EOF, literal: "", line: 2, column: 5 },
    ];
    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type);
        assertEquals(actualToken.literal, expectedToken.literal);
        assertEquals(actualToken.line, expectedToken.line);
        assertEquals(actualToken.column, expectedToken.column);
    }
});
