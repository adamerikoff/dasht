import { assertEquals } from "@std/assert";
import { Lexer, Token, TokenType, KeywordInfo, base_keywords, qzq_keywords, trk_keywords } from "../../src/lexer/mod.ts";
import { Parser } from "../../src/parser/mod.ts";

console.log("======================================");
console.log("======================================");
console.log("======================================");
console.log("======================================");
console.log("======================================");


Deno.test("Parser: handles ILLEGAL token", () => {
    const input = `~`; // An illegal character
    const expectedTokens: Token[] = [
        { type: TokenType.ILLEGAL, literal: "~", line: 1, column: 1 },
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