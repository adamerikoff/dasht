// tests/lexer_test.ts

import { assertEquals } from "@std/assert";
import { Lexer, Token, TokenType, KeywordInfo, base_keywords, qzq_keywords, trk_keywords } from "../../src/lexer/mod.ts";

console.log("======================================");
console.log("======================================");
console.log("======================================");
console.log("======================================");
console.log("======================================");

Deno.test("Lexer: handles ILLEGAL token", () => {
    const input = `;`; // An illegal character
    const expectedTokens: Token[] = [
        { type: TokenType.ILLEGAL, literal: ";", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles NEWLINE token", () => {
    const input = `\n\r\n`; // Various newline characters
    const expectedTokens: Token[] = [
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 2 }, // \r\n is usually treated as a single newline
        { type: TokenType.EOF, literal: "", line: 3, column: 1 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles EOF token", () => {
    const input = ``; // Empty input
    const expectedTokens: Token[] = [
        { type: TokenType.EOF, literal: "", line: 1, column: 1 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles IDENTIFIER token", () => {
    const input = `
    foobar
    x
    _ myVar123
    my_Var123
    `;
    const expectedTokens: Token[] = [
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "foobar", line: 2, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 11 },
        { type: TokenType.IDENTIFIER, literal: "x", line: 3, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 6 },
        { type: TokenType.ILLEGAL, literal: "_", line: 4, column: 5 },
        { type: TokenType.IDENTIFIER, literal: "myVar123", line: 4, column: 7 },
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 15 },
        { type: TokenType.IDENTIFIER, literal: "my_Var123", line: 5, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 5, column: 14 },
        { type: TokenType.EOF, literal: "", line: 6, column: 5 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles INTEGER token", () => {
    const input = `
    123
    0
    9876543210
    `;
    const expectedTokens: Token[] = [
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },
        { type: TokenType.INTEGER, literal: "123", line: 2, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 8 },
        { type: TokenType.INTEGER, literal: "0", line: 3, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 6 },
        { type: TokenType.INTEGER, literal: "9876543210", line: 4, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 15 },
        { type: TokenType.EOF, literal: "", line: 5, column: 5 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles FLOAT token", () => {
    const input = `
    1.23
    0.0
    0.5
    123.0
    `;
    const expectedTokens: Token[] = [
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },
        { type: TokenType.FLOAT, literal: "1.23", line: 2, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 9 },
        { type: TokenType.FLOAT, literal: "0.0", line: 3, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 8 },
        { type: TokenType.FLOAT, literal: "0.5", line: 4, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 8 },
        { type: TokenType.FLOAT, literal: "123.0", line: 5, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 5, column: 10 },
        { type: TokenType.EOF, literal: "", line: 6, column: 5 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles STRING token", () => {
    const input = `
    "hello world"
    "123"
    ""
    `;
    const expectedTokens: Token[] = [
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },
        { type: TokenType.STRING, literal: '"hello world"', line: 2, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 18 },
        { type: TokenType.STRING, literal: '"123"', line: 3, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 10 },
        { type: TokenType.STRING, literal: '""', line: 4, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 7 },
        { type: TokenType.EOF, literal: "", line: 5, column: 5 },
    ];

    const lexer = new Lexer(input);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles ASSIGN token", () => {
    const input = `=`;
    const expectedTokens: Token[] = [
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles PLUS token", () => {
    const input = `+`;
    const expectedTokens: Token[] = [
        { type: TokenType.PLUS, literal: "+", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles MINUS token", () => {
    const input = `-`;
    const expectedTokens: Token[] = [
        { type: TokenType.MINUS, literal: "-", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles BANG token", () => {
    const input = `!`;
    const expectedTokens: Token[] = [
        { type: TokenType.BANG, literal: "!", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles ASTERISK token", () => {
    const input = `*`;
    const expectedTokens: Token[] = [
        { type: TokenType.ASTERISK, literal: "*", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles SLASH token", () => {
    const input = `/`;
    const expectedTokens: Token[] = [
        { type: TokenType.SLASH, literal: "/", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles LT token", () => {
    const input = `<`;
    const expectedTokens: Token[] = [
        { type: TokenType.LT, literal: "<", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles GT token", () => {
    const input = `>`;
    const expectedTokens: Token[] = [
        { type: TokenType.GT, literal: ">", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles EQ token", () => {
    const input = `==`;
    const expectedTokens: Token[] = [
        { type: TokenType.EQ, literal: "==", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 3 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles NOT_EQ token", () => {
    const input = `!=`;
    const expectedTokens: Token[] = [
        { type: TokenType.NOT_EQ, literal: "!=", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 3 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles LTE token", () => {
    const input = `<=`;
    const expectedTokens: Token[] = [
        { type: TokenType.LTE, literal: "<=", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 3 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles GTE token", () => {
    const input = `>=`;
    const expectedTokens: Token[] = [
        { type: TokenType.GTE, literal: ">=", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 3 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles COMMA token", () => {
    const input = `,`;
    const expectedTokens: Token[] = [
        { type: TokenType.COMMA, literal: ",", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles LPAREN token", () => {
    const input = `(`;
    const expectedTokens: Token[] = [
        { type: TokenType.LPAREN, literal: "(", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles RPAREN token", () => {
    const input = `)`;
    const expectedTokens: Token[] = [
        { type: TokenType.RPAREN, literal: ")", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles LBRACE token", () => {
    const input = `{`;
    const expectedTokens: Token[] = [
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles RBRACE token", () => {
    const input = `}`;
    const expectedTokens: Token[] = [
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles LBRACKET token", () => {
    const input = `[`;
    const expectedTokens: Token[] = [
        { type: TokenType.LBRACKET, literal: "[", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles RBRACKET token", () => {
    const input = `]`;
    const expectedTokens: Token[] = [
        { type: TokenType.RBRACKET, literal: "]", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

// Define a type for your keyword test cases
interface KeywordTestCase {
    name: string;
    inputKeywords: { [key: string]: KeywordInfo };
    description: string;
}

const keywordTestCases: KeywordTestCase[] = [
    {
        name: "Base English Keywords",
        inputKeywords: base_keywords,
        description: "handles base English keywords correctly",
    },
    {
        name: "Kazakh Keywords (QZ)",
        inputKeywords: qzq_keywords,
        description: "handles Kazakh keywords (QZ) correctly",
    },
    {
        name: "Turkish Keywords (TRK)",
        inputKeywords: trk_keywords,
        description: "handles Turkish keywords (TRK) correctly",
    },
];

keywordTestCases.forEach((testCase) => {
    // Iterate over each keyword in the current language's map
    for (const inputKeyword in testCase.inputKeywords) {
        if (Object.prototype.hasOwnProperty.call(testCase.inputKeywords, inputKeyword)) {
            const keywordInfo = testCase.inputKeywords[inputKeyword];

            Deno.test(`Lexer: ${testCase.name} - '${inputKeyword}' ${testCase.description}`, () => {
                const input = inputKeyword; // The actual keyword string from the input map
                const expectedTokenType = keywordInfo.type; // The TokenType enum value
                const expectedBaseLiteral = keywordInfo.baseLiteral; // The unified base literal

                const expectedTokens: Token[] = [
                    { type: expectedTokenType, literal: expectedBaseLiteral, line: 1, column: 1 },
                    { type: TokenType.EOF, literal: "", line: 1, column: input.length + 1 },
                ];

                // Pass the specific keyword map to the Lexer constructor
                const lexer = new Lexer(input, testCase.inputKeywords);

                const token1 = lexer.nextToken();
                assertEquals(token1, expectedTokens[0], `Expected token for '${inputKeyword}' to be ${JSON.stringify(expectedTokens[0])}, but got ${JSON.stringify(token1)}`);

                const token2 = lexer.nextToken();
                assertEquals(token2, expectedTokens[1], `Expected EOF for '${inputKeyword}' to be ${JSON.stringify(expectedTokens[1])}, but got ${JSON.stringify(token2)}`);
            });
        }
    }
});

// Test for combinations of keywords and identifiers
Deno.test("Lexer: recognizes keywords amidst identifiers and operators", () => {
    const input = `let x = true fn add(a, b) { return a + b }`;
    const expectedTokens: Token[] = [
        { type: TokenType.LET, literal: "let", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "x", line: 1, column: 5 },
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 7 },
        { type: TokenType.TRUE, literal: "true", line: 1, column: 9 },
        { type: TokenType.FUNCTION, literal: "fn", line: 1, column: 14 },
        { type: TokenType.IDENTIFIER, literal: "add", line: 1, column: 17 },
        { type: TokenType.LPAREN, literal: "(", line: 1, column: 20 },
        { type: TokenType.IDENTIFIER, literal: "a", line: 1, column: 21 },
        { type: TokenType.COMMA, literal: ",", line: 1, column: 22 },
        { type: TokenType.IDENTIFIER, literal: "b", line: 1, column: 24 },
        { type: TokenType.RPAREN, literal: ")", line: 1, column: 25 },
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 27 },
        { type: TokenType.RETURN, literal: "return", line: 1, column: 29 },
        { type: TokenType.IDENTIFIER, literal: "a", line: 1, column: 36 },
        { type: TokenType.PLUS, literal: "+", line: 1, column: 38 },
        { type: TokenType.IDENTIFIER, literal: "b", line: 1, column: 40 },
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 42 },
        { type: TokenType.EOF, literal: "", line: 1, column: 43 },
    ];
    const lexer = new Lexer(input);
    expectedTokens.forEach((expectedToken) => {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken, expectedToken, `Expected ${JSON.stringify(expectedToken)}, got ${JSON.stringify(actualToken)}`);
    });
});

Deno.test("Lexer: handles mixed language keywords and other tokens", () => {
    // Example with Kazakh 'болсын' (let) and English operators/numbers
    const input = `болсын x = 10 егер x > 5 { қайтару шын }`;
    const expectedTokens: Token[] = [
        { type: TokenType.LET, literal: "let", line: 1, column: 1 }, // 'болсын' -> 'let'
        { type: TokenType.IDENTIFIER, literal: "x", line: 1, column: 8 },
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 10 },
        { type: TokenType.INTEGER, literal: "10", line: 1, column: 12 },
        { type: TokenType.IF, literal: "if", line: 1, column: 15 }, // 'егер' -> 'if'
        { type: TokenType.IDENTIFIER, literal: "x", line: 1, column: 20 },
        { type: TokenType.GT, literal: ">", line: 1, column: 22 },
        { type: TokenType.INTEGER, literal: "5", line: 1, column: 24 },
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 26 },
        { type: TokenType.RETURN, literal: "return", line: 1, column: 28 }, // 'қайтару' -> 'return'
        { type: TokenType.TRUE, literal: "true", line: 1, column: 36 }, // 'шын' -> 'true'
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 40 },
        { type: TokenType.EOF, literal: "", line: 1, column: 41 },
    ];

    // Important: Use qzq_keywords for this test case
    const lexer = new Lexer(input, qzq_keywords);

    expectedTokens.forEach((expectedToken) => {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken, expectedToken, `Expected ${JSON.stringify(expectedToken)}, got ${JSON.stringify(actualToken)}`);
    });
});

Deno.test("Lexer: handles Turkish keywords and complex expressions", () => {
    const input = `eğer (sayi > 0) { döndür doğru } yoksa { döndür yanlış }`;
    const expectedTokens: Token[] = [
        { type: TokenType.IF, literal: "if", line: 1, column: 1 }, // 'eğer' -> 'if'
        { type: TokenType.LPAREN, literal: "(", line: 1, column: 6 },
        { type: TokenType.IDENTIFIER, literal: "sayi", line: 1, column: 7 },
        { type: TokenType.GT, literal: ">", line: 1, column: 12 },
        { type: TokenType.INTEGER, literal: "0", line: 1, column: 14 },
        { type: TokenType.RPAREN, literal: ")", line: 1, column: 15 },
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 17 },
        { type: TokenType.RETURN, literal: "return", line: 1, column: 19 }, // 'döndür' -> 'return'
        { type: TokenType.TRUE, literal: "true", line: 1, column: 26 }, // 'doğru' -> 'true'
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 32 },
        { type: TokenType.ELSE, literal: "else", line: 1, column: 34 }, // 'yoksa' -> 'else'
        { type: TokenType.LBRACE, literal: "{", line: 1, column: 40 },
        { type: TokenType.RETURN, literal: "return", line: 1, column: 42 }, // 'döndür' -> 'return'
        { type: TokenType.FALSE, literal: "false", line: 1, column: 49 }, // 'yanlış' -> 'false'
        { type: TokenType.RBRACE, literal: "}", line: 1, column: 56 },
        { type: TokenType.EOF, literal: "", line: 1, column: 57 },
    ];

    // Important: Use trk_keywords for this test case
    const lexer = new Lexer(input, trk_keywords);

    expectedTokens.forEach((expectedToken) => {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken, expectedToken, `Expected ${JSON.stringify(expectedToken)}, got ${JSON.stringify(actualToken)}`);
    });
});

Deno.test("Lexer: handles identifiers that are substrings of keywords", () => {
    const input = `football`; // "for" is a keyword, "football" is not.
    const expectedTokens: Token[] = [
        { type: TokenType.IDENTIFIER, literal: "football", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 9 },
    ];
    const lexer = new Lexer(input); // Defaults to base_keywords
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: handles identifiers that contain keywords as substrings", () => {
    const input = `myletrules`; // "let" is a keyword, "myletrules" is not.
    const expectedTokens: Token[] = [
        { type: TokenType.IDENTIFIER, literal: "myletrules", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 11 },
    ];
    const lexer = new Lexer(input);
    assertEquals(lexer.nextToken(), expectedTokens[0]);
    assertEquals(lexer.nextToken(), expectedTokens[1]);
});

Deno.test("Lexer: correctly handles numbers and keywords mixed", () => {
    const input = `123 if 456 else 789`;
    const expectedTokens: Token[] = [
        { type: TokenType.INTEGER, literal: "123", line: 1, column: 1 },
        { type: TokenType.IF, literal: "if", line: 1, column: 5 },
        { type: TokenType.INTEGER, literal: "456", line: 1, column: 8 },
        { type: TokenType.ELSE, literal: "else", line: 1, column: 12 },
        { type: TokenType.INTEGER, literal: "789", line: 1, column: 17 },
        { type: TokenType.EOF, literal: "", line: 1, column: 20 },
    ];
    const lexer = new Lexer(input);
    expectedTokens.forEach((expectedToken) => {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken, expectedToken, `Expected ${JSON.stringify(expectedToken)}, got ${JSON.stringify(actualToken)}`);
    });
});

Deno.test("Lexer: correctly handles whitespace variations around keywords", () => {
    const input = `  let   \t  x = \n true\r\n`;
    const expectedTokens: Token[] = [
        { type: TokenType.LET, literal: "let", line: 1, column: 3 },
        { type: TokenType.IDENTIFIER, literal: "x", line: 1, column: 12 },
        { type: TokenType.ASSIGN, literal: "=", line: 1, column: 14 },
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 16 },
        { type: TokenType.TRUE, literal: "true", line: 2, column: 2 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 7 }, // Accounts for \r\n
        { type: TokenType.EOF, literal: "", line: 3, column: 1 },
    ];
    const lexer = new Lexer(input);
    expectedTokens.forEach((expectedToken) => {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken, expectedToken, `Expected ${JSON.stringify(expectedToken)}, got ${JSON.stringify(actualToken)}`);
    });
});

Deno.test("Lexer: handles all operators and combinations", () => {
    // Input string combining various operators, including those with whitespace
    const input = `
    =
    +
    -
    !
    *
    /
    <
    >
    ==
    !=
    <=
    >=
    +=!*<>/==!=<=>=
     + - ! * / < > == != <= >=
    `;

    // Expected tokens for the combined input
    const expectedTokens: Token[] = [
        // Tokens for line 2: "="
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },
        { type: TokenType.ASSIGN, literal: "=", line: 2, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 6 },
        // Tokens for line 3: "+"
        { type: TokenType.PLUS, literal: "+", line: 3, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 6 },
        // Tokens for line 4: "-"
        { type: TokenType.MINUS, literal: "-", line: 4, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 6 },
        // Tokens for line 5: "!"
        { type: TokenType.BANG, literal: "!", line: 5, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 5, column: 6 },
        // Tokens for line 6: "*"
        { type: TokenType.ASTERISK, literal: "*", line: 6, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 6, column: 6 },
        // Tokens for line 7: "/"
        { type: TokenType.SLASH, literal: "/", line: 7, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 7, column: 6 },
        // Tokens for line 8: "<"
        { type: TokenType.LT, literal: "<", line: 8, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 8, column: 6 },
        // Tokens for line 9: ">"
        { type: TokenType.GT, literal: ">", line: 9, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 9, column: 6 },
        // Tokens for line 10: "=="
        { type: TokenType.EQ, literal: "==", line: 10, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 10, column: 7 },
        // Tokens for line 11: "!="
        { type: TokenType.NOT_EQ, literal: "!=", line: 11, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 11, column: 7 },
        // Tokens for line 12: "<="
        { type: TokenType.LTE, literal: "<=", line: 12, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 12, column: 7 },
        // Tokens for line 13: ">="
        { type: TokenType.GTE, literal: ">=", line: 13, column: 5 },
        { type: TokenType.NEWLINE, literal: "\n", line: 13, column: 7 },
        // Tokens for line 14: "+=!*</>==!=<=>="
        { type: TokenType.PLUS, literal: "+", line: 14, column: 5 },
        { type: TokenType.ASSIGN, literal: "=", line: 14, column: 6 },
        { type: TokenType.BANG, literal: "!", line: 14, column: 7 },
        { type: TokenType.ASTERISK, literal: "*", line: 14, column: 8 },
        { type: TokenType.LT, literal: "<", line: 14, column: 9 },
        { type: TokenType.GT, literal: ">", line: 14, column: 10 },
        { type: TokenType.SLASH, literal: "/", line: 14, column: 11 },
        { type: TokenType.EQ, literal: "==", line: 14, column: 12 },
        { type: TokenType.NOT_EQ, literal: "!=", line: 14, column: 14 },
        { type: TokenType.LTE, literal: "<=", line: 14, column: 16 },
        { type: TokenType.GTE, literal: ">=", line: 14, column: 18 },
        { type: TokenType.NEWLINE, literal: "\n", line: 14, column: 20 },
        // Tokens for line 15: " + - ! * / < > == != <= >= "
        { type: TokenType.PLUS, literal: "+", line: 15, column: 6 },
        { type: TokenType.MINUS, literal: "-", line: 15, column: 8 },
        { type: TokenType.BANG, literal: "!", line: 15, column: 10 },
        { type: TokenType.ASTERISK, literal: "*", line: 15, column: 12 },
        { type: TokenType.SLASH, literal: "/", line: 15, column: 14 },
        { type: TokenType.LT, literal: "<", line: 15, column: 16 },
        { type: TokenType.GT, literal: ">", line: 15, column: 18 },
        { type: TokenType.EQ, literal: "==", line: 15, column: 20 },
        { type: TokenType.NOT_EQ, literal: "!=", line: 15, column: 23 },
        { type: TokenType.LTE, literal: "<=", line: 15, column: 26 },
        { type: TokenType.GTE, literal: ">=", line: 15, column: 29 },
        { type: TokenType.NEWLINE, literal: "\n", line: 15, column: 31 }, // Newline after the last line
        { type: TokenType.EOF, literal: "", line: 16, column: 5 }, // EOF at the very end
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles delimiters", () => {
    const input = `
    , ( ) { } [ ]
    ,(){}[]
    `;

    const expectedTokens: Token[] = [
        // Tokens for initial newline and leading spaces
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },

        // Tokens for line 2: ", ( ) { } [ ]"
        { type: TokenType.COMMA, literal: ",", line: 2, column: 5 },
        { type: TokenType.LPAREN, literal: "(", line: 2, column: 7 },
        { type: TokenType.RPAREN, literal: ")", line: 2, column: 9 },
        { type: TokenType.LBRACE, literal: "{", line: 2, column: 11 },
        { type: TokenType.RBRACE, literal: "}", line: 2, column: 13 },
        { type: TokenType.LBRACKET, literal: "[", line: 2, column: 15 },
        { type: TokenType.RBRACKET, literal: "]", line: 2, column: 17 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 18 },

        // Tokens for line 3: ",(){}[]" (no spaces)
        { type: TokenType.COMMA, literal: ",", line: 3, column: 5 },
        { type: TokenType.LPAREN, literal: "(", line: 3, column: 6 },
        { type: TokenType.RPAREN, literal: ")", line: 3, column: 7 },
        { type: TokenType.LBRACE, literal: "{", line: 3, column: 8 },
        { type: TokenType.RBRACE, literal: "}", line: 3, column: 9 },
        { type: TokenType.LBRACKET, literal: "[", line: 3, column: 10 },
        { type: TokenType.RBRACKET, literal: "]", line: 3, column: 11 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 12 },

        // EOF token
        { type: TokenType.EOF, literal: "", line: 4, column: 5 },
    ];

    const lexer = new Lexer(input);

    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});


Deno.test("Lexer: comprehensive test with all token types (no semicolons, indented)", () => {
    const input = `
    let five = 5
    let ten = 10.5
    let add = fn(x, y) {
        x + y
    }
    let result = add(five, ten)
    !-*/
    5 < 10 > 5
    1 == 1
    1 != 2
    1 <= 1
    2 >= 1
    if (result < 10 ) {
        return true
    } elsif (result > 10) {
        return false
    } else {
        return "equal"
    }
    [1, 2, "three"]
    "hello" and "world" or 123
    for (let i = 0, i < 5, i = i + 1) {
    }
    while (true) {
    }
    `;

    const expectedTokens: Token[] = [
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 1 },

        { type: TokenType.LET, literal: "let", line: 2, column: 5 }, // 1 + 4
        { type: TokenType.IDENTIFIER, literal: "five", line: 2, column: 9 }, // 5 + 4
        { type: TokenType.ASSIGN, literal: "=", line: 2, column: 14 }, // 10 + 4
        { type: TokenType.INTEGER, literal: "5", line: 2, column: 16 }, // 12 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 17 }, // 13 + 4

        { type: TokenType.LET, literal: "let", line: 3, column: 5 }, // 1 + 4
        { type: TokenType.IDENTIFIER, literal: "ten", line: 3, column: 9 }, // 5 + 4
        { type: TokenType.ASSIGN, literal: "=", line: 3, column: 13 }, // 9 + 4
        { type: TokenType.FLOAT, literal: "10.5", line: 3, column: 15 }, // 11 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 19 }, // 15 + 4

        { type: TokenType.LET, literal: "let", line: 4, column: 5 }, // 1 + 4
        { type: TokenType.IDENTIFIER, literal: "add", line: 4, column: 9 }, // 5 + 4
        { type: TokenType.ASSIGN, literal: "=", line: 4, column: 13 }, // 9 + 4
        { type: TokenType.FUNCTION, literal: "fn", line: 4, column: 15 }, // 11 + 4
        { type: TokenType.LPAREN, literal: "(", line: 4, column: 17 }, // 13 + 4
        { type: TokenType.IDENTIFIER, literal: "x", line: 4, column: 18 }, // 14 + 4
        { type: TokenType.COMMA, literal: ",", line: 4, column: 19 }, // 15 + 4
        { type: TokenType.IDENTIFIER, literal: "y", line: 4, column: 21 }, // 17 + 4
        { type: TokenType.RPAREN, literal: ")", line: 4, column: 22 }, // 18 + 4
        { type: TokenType.LBRACE, literal: "{", line: 4, column: 24 }, // 20 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 4, column: 25 }, // 21 + 4
        { type: TokenType.IDENTIFIER, literal: "x", line: 5, column: 9 }, // 5 + 4
        { type: TokenType.PLUS, literal: "+", line: 5, column: 11 }, // 7 + 4
        { type: TokenType.IDENTIFIER, literal: "y", line: 5, column: 13 }, // 9 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 5, column: 14 }, // 10 + 4
        { type: TokenType.RBRACE, literal: "}", line: 6, column: 5 }, // 1 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 6, column: 6 }, // 2 + 4

        { type: TokenType.LET, literal: "let", line: 7, column: 5 }, // 1 + 4
        { type: TokenType.IDENTIFIER, literal: "result", line: 7, column: 9 }, // 5 + 4
        { type: TokenType.ASSIGN, literal: "=", line: 7, column: 16 }, // 12 + 4
        { type: TokenType.IDENTIFIER, literal: "add", line: 7, column: 18 }, // 14 + 4
        { type: TokenType.LPAREN, literal: "(", line: 7, column: 21 }, // 17 + 4
        { type: TokenType.IDENTIFIER, literal: "five", line: 7, column: 22 }, // 18 + 4
        { type: TokenType.COMMA, literal: ",", line: 7, column: 26 }, // 22 + 4
        { type: TokenType.IDENTIFIER, literal: "ten", line: 7, column: 28 }, // 24 + 4
        { type: TokenType.RPAREN, literal: ")", line: 7, column: 31 }, // 27 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 7, column: 32 }, // 28 + 4

        { type: TokenType.BANG, literal: "!", line: 8, column: 5 }, // 1 + 4
        { type: TokenType.MINUS, literal: "-", line: 8, column: 6 }, // 2 + 4
        { type: TokenType.ASTERISK, literal: "*", line: 8, column: 7 }, // 3 + 4
        { type: TokenType.SLASH, literal: "/", line: 8, column: 8 }, // 4 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 8, column: 9 }, // 5 + 4

        { type: TokenType.INTEGER, literal: "5", line: 9, column: 5 }, // 1 + 4
        { type: TokenType.LT, literal: "<", line: 9, column: 7 }, // 3 + 4
        { type: TokenType.INTEGER, literal: "10", line: 9, column: 9 }, // 5 + 4
        { type: TokenType.GT, literal: ">", line: 9, column: 12 }, // 8 + 4
        { type: TokenType.INTEGER, literal: "5", line: 9, column: 14 }, // 10 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 9, column: 15 }, // 11 + 4

        { type: TokenType.INTEGER, literal: "1", line: 10, column: 5 }, // 1 + 4
        { type: TokenType.EQ, literal: "==", line: 10, column: 7 }, // 3 + 4
        { type: TokenType.INTEGER, literal: "1", line: 10, column: 10 }, // 6 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 10, column: 11 }, // 7 + 4

        { type: TokenType.INTEGER, literal: "1", line: 11, column: 5 }, // 1 + 4
        { type: TokenType.NOT_EQ, literal: "!=", line: 11, column: 7 }, // 3 + 4
        { type: TokenType.INTEGER, literal: "2", line: 11, column: 10 }, // 6 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 11, column: 11 }, // 7 + 4

        { type: TokenType.INTEGER, literal: "1", line: 12, column: 5 }, // 1 + 4
        { type: TokenType.LTE, literal: "<=", line: 12, column: 7 }, // 3 + 4
        { type: TokenType.INTEGER, literal: "1", line: 12, column: 10 }, // 6 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 12, column: 11 }, // 7 + 4

        { type: TokenType.INTEGER, literal: "2", line: 13, column: 5 }, // 1 + 4
        { type: TokenType.GTE, literal: ">=", line: 13, column: 7 }, // 3 + 4
        { type: TokenType.INTEGER, literal: "1", line: 13, column: 10 }, // 6 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 13, column: 11 }, // 7 + 4

        { type: TokenType.IF, literal: "if", line: 14, column: 5 }, // 1 + 4
        { type: TokenType.LPAREN, literal: "(", line: 14, column: 8 }, // 4 + 4
        { type: TokenType.IDENTIFIER, literal: "result", line: 14, column: 9 }, // 5 + 4
        { type: TokenType.LT, literal: "<", line: 14, column: 16 }, // 12 + 4
        { type: TokenType.INTEGER, literal: "10", line: 14, column: 18 }, // 15 + 4
        { type: TokenType.RPAREN, literal: ")", line: 14, column: 21 }, // 17 + 4
        { type: TokenType.LBRACE, literal: "{", line: 14, column: 23 }, // 19 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 14, column: 24 }, // 20 + 4
        { type: TokenType.RETURN, literal: "return", line: 15, column: 9 }, // 5 + 4
        { type: TokenType.TRUE, literal: "true", line: 15, column: 16 }, // 12 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 15, column: 20 }, // 16 + 4
        { type: TokenType.RBRACE, literal: "}", line: 16, column: 5 }, // 1 + 4
        { type: TokenType.ELSIF, literal: "elsif", line: 16, column: 7 }, // 8 + 4
        { type: TokenType.LPAREN, literal: "(", line: 16, column: 13 }, // 14 + 4
        { type: TokenType.IDENTIFIER, literal: "result", line: 16, column: 14 }, // 15 + 4
        { type: TokenType.GT, literal: ">", line: 16, column: 21 }, // 22 + 4
        { type: TokenType.INTEGER, literal: "10", line: 16, column: 23 }, // 25 + 4
        { type: TokenType.RPAREN, literal: ")", line: 16, column: 25 }, // 27 + 4
        { type: TokenType.LBRACE, literal: "{", line: 16, column: 27 }, // 29 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 16, column: 28 }, // 30 + 4
        { type: TokenType.RETURN, literal: "return", line: 17, column: 9 }, // 5 + 4
        { type: TokenType.FALSE, literal: "false", line: 17, column: 16 }, // 12 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 17, column: 21 }, // 17 + 4
        { type: TokenType.RBRACE, literal: "}", line: 18, column: 5 }, // 1 + 4
        { type: TokenType.ELSE, literal: "else", line: 18, column: 7 }, // 3 + 4
        { type: TokenType.LBRACE, literal: "{", line: 18, column: 12 }, // 8 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 18, column: 13 }, // 9 + 4
        { type: TokenType.RETURN, literal: "return", line: 19, column: 9 }, // 5 + 4
        { type: TokenType.STRING, literal: '"equal"', line: 19, column: 16 }, // 12 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 19, column: 23 }, // 19 + 4
        { type: TokenType.RBRACE, literal: "}", line: 20, column: 5 }, // 1 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 20, column: 6 }, // 2 + 4

        { type: TokenType.LBRACKET, literal: "[", line: 21, column: 5 }, // 1 + 4
        { type: TokenType.INTEGER, literal: "1", line: 21, column: 6 }, // 2 + 4
        { type: TokenType.COMMA, literal: ",", line: 21, column: 7 }, // 3 + 4
        { type: TokenType.INTEGER, literal: "2", line: 21, column: 9 }, // 5 + 4
        { type: TokenType.COMMA, literal: ",", line: 21, column: 10 }, // 6 + 4
        { type: TokenType.STRING, literal: '"three"', line: 21, column: 12 }, // 8 + 4
        { type: TokenType.RBRACKET, literal: "]", line: 21, column: 19 }, // 15 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 21, column: 20 }, // 16 + 4

        { type: TokenType.STRING, literal: '"hello"', line: 22, column: 5 }, // 1 + 4
        { type: TokenType.AND, literal: "and", line: 22, column: 13 }, // 9 + 4
        { type: TokenType.STRING, literal: '"world"', line: 22, column: 17 }, // 15 + 4
        { type: TokenType.OR, literal: "or", line: 22, column: 25 }, // 23 + 4
        { type: TokenType.INTEGER, literal: "123", line: 22, column: 28 }, // 26 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 22, column: 31 }, // 29 + 4

        { type: TokenType.FOR, literal: "for", line: 23, column: 5 }, // 1 + 4
        { type: TokenType.LPAREN, literal: "(", line: 23, column: 9 }, // 5 + 4
        { type: TokenType.LET, literal: "let", line: 23, column: 10 }, // 6 + 4
        { type: TokenType.IDENTIFIER, literal: "i", line: 23, column: 14 }, // 10 + 4
        { type: TokenType.ASSIGN, literal: "=", line: 23, column: 16 }, // 12 + 4
        { type: TokenType.INTEGER, literal: "0", line: 23, column: 18 }, // 14 + 4
        { type: TokenType.COMMA, literal: ",", line: 23, column: 19 },
        { type: TokenType.IDENTIFIER, literal: "i", line: 23, column: 21 }, // 16 + 4
        { type: TokenType.LT, literal: "<", line: 23, column: 23 }, // 18 + 4
        { type: TokenType.INTEGER, literal: "5", line: 23, column: 25 }, // 20 + 4
        { type: TokenType.COMMA, literal: ",", line: 23, column: 26 },
        { type: TokenType.IDENTIFIER, literal: "i", line: 23, column: 28 }, // 22 + 4
        { type: TokenType.ASSIGN, literal: "=", line: 23, column: 30 }, // 24 + 4
        { type: TokenType.IDENTIFIER, literal: "i", line: 23, column: 32 }, // 26 + 4
        { type: TokenType.PLUS, literal: "+", line: 23, column: 34 }, // 28 + 4
        { type: TokenType.INTEGER, literal: "1", line: 23, column: 36 }, // 30 + 4
        { type: TokenType.RPAREN, literal: ")", line: 23, column: 37 }, // 31 + 4
        { type: TokenType.LBRACE, literal: "{", line: 23, column: 39 }, // 33 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 23, column: 40 }, // 34 + 4
        { type: TokenType.RBRACE, literal: "}", line: 24, column: 5 }, // 1 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 24, column: 6 }, // 2 + 4

        { type: TokenType.WHILE, literal: "while", line: 25, column: 5 }, // 1 + 4
        { type: TokenType.LPAREN, literal: "(", line: 25, column: 11 }, // 7 + 4
        { type: TokenType.TRUE, literal: "true", line: 25, column: 12 }, // 8 + 4
        { type: TokenType.RPAREN, literal: ")", line: 25, column: 16 }, // 12 + 4
        { type: TokenType.LBRACE, literal: "{", line: 25, column: 18 }, // 14 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 25, column: 19 }, // 15 + 4
        { type: TokenType.RBRACE, literal: "}", line: 26, column: 5 }, // 1 + 4
        { type: TokenType.NEWLINE, literal: "\n", line: 26, column: 6 }, // 2 + 4

        { type: TokenType.EOF, literal: "", line: 27, column: 5 }, // 1 + 4
    ];

    const lexer = new Lexer(input, base_keywords); // Explicitly use base_keywords

    for (let i = 0; i < expectedTokens.length; i++) {
        const expectedToken = expectedTokens[i];
        const actualToken = lexer.nextToken();

        assertEquals(actualToken.type, expectedToken.type, `Mismatch at token ${i}: Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Mismatch at token ${i}: Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Mismatch at token ${i}: Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Mismatch at token ${i}: Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

// --- Updated Test: Lexer handles single TILDE character ---
Deno.test("Lexer: handles single TILDE token", () => {
    const input = `~`;
    const expectedTokens: Token[] = [
        // Now it should be a TILDE token, not ILLEGAL
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        { type: TokenType.EOF, literal: "", line: 1, column: 2 },
    ];

    // Instantiate lexer with base_keywords as the initial set
    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

// --- New Tests for Tilde with Mode Identifiers ---

Deno.test("Lexer: handles ~trk directive", () => {
    const input = `~trk`;
    const expectedTokens: Token[] = [
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "trk", line: 1, column: 2 }, // "trk" is an IDENTIFIER at lexer level
        { type: TokenType.EOF, literal: "", line: 1, column: 5 },
    ];

    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles ~qzq directive", () => {
    const input = `~qzq`;
    const expectedTokens: Token[] = [
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "qzq", line: 1, column: 2 }, // "qzq" is an IDENTIFIER at lexer level
        { type: TokenType.EOF, literal: "", line: 1, column: 5 },
    ];

    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles ~base directive", () => {
    const input = `~base`;
    const expectedTokens: Token[] = [
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "base", line: 1, column: 2 }, // "base" is an IDENTIFIER at lexer level
        { type: TokenType.EOF, literal: "", line: 1, column: 6 },
    ];

    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles ~invalid_mode (unknown directive)", () => {
    const input = `~invalid_mode`;
    const expectedTokens: Token[] = [
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "invalid_mode", line: 1, column: 2 }, // Still an IDENTIFIER for the lexer
        { type: TokenType.EOF, literal: "", line: 1, column: 14 },
    ];

    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles ~ followed by whitespace then identifier", () => {
    const input = `~   qzq`; // Tilde, then spaces, then identifier
    const expectedTokens: Token[] = [
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        // Whitespace is skipped, so the column of 'qzq' is adjusted
        { type: TokenType.IDENTIFIER, literal: "qzq", line: 1, column: 5 },
        { type: TokenType.EOF, literal: "", line: 1, column: 8 },
    ];

    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});

Deno.test("Lexer: handles multiple mode directives on separate lines", () => {
    const input = `~qzq
let x = 10
~trk
let y = 20`;
    const expectedTokens: Token[] = [
        { type: TokenType.TILDE, literal: "~", line: 1, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "qzq", line: 1, column: 2 },
        { type: TokenType.NEWLINE, literal: "\n", line: 1, column: 5 },

        { type: TokenType.LET, literal: "let", line: 2, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "x", line: 2, column: 5 },
        { type: TokenType.ASSIGN, literal: "=", line: 2, column: 7 },
        { type: TokenType.INTEGER, literal: "10", line: 2, column: 9 },
        { type: TokenType.NEWLINE, literal: "\n", line: 2, column: 11 },

        { type: TokenType.TILDE, literal: "~", line: 3, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "trk", line: 3, column: 2 },
        { type: TokenType.NEWLINE, literal: "\n", line: 3, column: 5 },

        { type: TokenType.LET, literal: "let", line: 4, column: 1 },
        { type: TokenType.IDENTIFIER, literal: "y", line: 4, column: 5 },
        { type: TokenType.ASSIGN, literal: "=", line: 4, column: 7 },
        { type: TokenType.INTEGER, literal: "20", line: 4, column: 9 },
        { type: TokenType.EOF, literal: "", line: 4, column: 11 },
    ];

    const lexer = new Lexer(input, base_keywords);
    for (const expectedToken of expectedTokens) {
        const actualToken = lexer.nextToken();
        assertEquals(actualToken.type, expectedToken.type, `Expected type ${expectedToken.type} ('${expectedToken.literal}'), got ${actualToken.type} ('${actualToken.literal}') at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.literal, expectedToken.literal, `Expected literal '${expectedToken.literal}', got '${actualToken.literal}' at line ${actualToken.line}, col ${actualToken.column}`);
        assertEquals(actualToken.line, expectedToken.line, `Expected line ${expectedToken.line}, got ${actualToken.line} for literal '${expectedToken.literal}'`);
        assertEquals(actualToken.column, expectedToken.column, `Expected column ${expectedToken.column}, got ${actualToken.column} for literal '${expectedToken.literal}'`);
    }
});