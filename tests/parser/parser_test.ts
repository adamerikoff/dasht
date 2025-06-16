import { assert, assertEquals, assertExists, assertInstanceOf } from "@std/assert";
import { Lexer, Token, TokenType, base_keywords, qzq_keywords, trk_keywords } from "../../src/lexer/mod.ts";
import { ParserError, Parser } from "../../src/parser/mod.ts";
import {
    Program,
    Statement,
    Expression,
    Identifier,
    IntegerLiteral,
    FloatLiteral,
    StringLiteral,
    BooleanLiteral,
    ExpressionStatement,
    PrefixExpression
} from "../../src/ast/mod.ts";

/** Asserts that an expression is a StringLiteral with the expected value. */
function testStringLiteral(exp: Expression, expectedValue: string) {
    assertEquals(exp.type, "StringLiteral", `Expected AST node type to be "StringLiteral", got "${exp.type}"`);
    const strLit = exp as StringLiteral;
    
    // Check the unquoted content
    assertEquals(strLit.value, expectedValue, `Expected StringLiteral value to be "${expectedValue}", got "${strLit.value}"`);
    
    // Check that the token includes the quotes
    assertEquals(strLit.token?.literal, `"${expectedValue}"`, `Expected StringLiteral token literal to be '"${expectedValue}"', got '${strLit.token?.literal}'`);
}

/** Asserts that an expression is a BooleanLiteral with the expected value. */
function testBooleanLiteral(exp: Expression, expectedValue: boolean) {
    assertEquals(exp.type, "BooleanLiteral", `Expected AST node type to be "BooleanLiteral", got "${exp.type}"`);
    const boolLit = exp as BooleanLiteral;
    assertEquals(boolLit.value, expectedValue, `Expected BooleanLiteral value to be ${expectedValue}, got ${boolLit.value}`);
    assertEquals(boolLit.token?.literal, expectedValue.toString(), `Expected BooleanLiteral token literal to be '${expectedValue}', got '${boolLit.token?.literal}'`);
}

/** Asserts that an expression is an IntegerLiteral with the expected value. */
function testIntegerLiteral(exp: Expression, expectedValue: number) {
    // Check that the runtime type of the AST node is an IntegerLiteral
    // In TypeScript, this is usually done by checking the 'type' property of the interface.
    // If you were using classes, you'd use 'exp instanceof IntegerLiteralClass'.
    // Given your interfaces, we assert the 'type' string.
    assertEquals(exp.type, "IntegerLiteral", `Expected AST node type to be "IntegerLiteral", got "${exp.type}"`);
    const intLit = exp as IntegerLiteral; // Cast to access specific properties
    assertEquals(intLit.value, expectedValue, `Expected IntegerLiteral value to be ${expectedValue}, got ${intLit.value}`);
    assertEquals(intLit.token?.literal, expectedValue.toString(), `Expected IntegerLiteral token literal to be '${expectedValue}', got '${intLit.token?.literal}'`);
}

/** Asserts that an expression is a FloatLiteral with the expected value and optionally its literal string. */
function testFloatLiteral(exp: Expression, expectedValue: number, expectedLiteral?: string) {
    assertEquals(exp.type, "FloatLiteral", `Expected AST node type to be "FloatLiteral", got "${exp.type}"`);
    const floatLit = exp as FloatLiteral;
    assertEquals(floatLit.value, expectedValue, `Expected FloatLiteral value to be ${expectedValue}, got ${floatLit.value}`);
    
    if (expectedLiteral !== undefined) {
        assertEquals(floatLit.token?.literal, expectedLiteral, `Expected FloatLiteral token literal to be '${expectedLiteral}', got '${floatLit.token?.literal}'`);
    } else {
        // Fallback: This might still fail for inputs like "1.0" vs "1"
        // It's safer to always provide expectedLiteral for floats.
        assertEquals(floatLit.token?.literal, expectedValue.toString(), `Expected FloatLiteral token literal to be '${expectedValue.toString()}', got '${floatLit.token?.literal}'`);
    }
}

/**
 * Helper to check for parser errors. If any errors exist, it logs them and throws
 * an assertion error, failing the test.
 */
function checkParserErrors(parser: Parser): void {
    const errors = parser.getErrors();
    if (errors.length === 0) {
        return; // No errors, good!
    }
    console.error(`\nParser had ${errors.length} errors:`);
    errors.forEach(err => console.error(`  - ${err.message} (Line: ${err.line}, Col: ${err.column})`));
    throw new Error(`Parser errors detected, failing test.`);
}

console.log("======================================");
console.log("======================================");
console.log("======================================");
console.log("======================================");
console.log("======================================");

// --- Test Suites ---

Deno.test("Parser: successfully parses single integer literal statement", () => {
    const input = `123`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    // 1. Check for parser errors
    checkParserErrors(parser);
    // 2. Ensure a Program AST node was returned
    assertExists(program, "Parser should return a Program AST node for valid input.");
    // 3. Check the number of top-level statements
    assertEquals(program.statements.length, 1, `Expected 1 statement, got ${program.statements.length}`);

    // 4. Verify the type of the statement (should be ExpressionStatement)
    const statement = program.statements[0];
    assertEquals(statement.type, "ExpressionStatement", `Expected statement type to be "ExpressionStatement", got "${statement.type}"`);

    // 5. Verify the expression within the statement (should be an IntegerLiteral)
    const exprStmt = statement as ExpressionStatement; // Cast for type narrowing
    assertExists(exprStmt.expression, "ExpressionStatement should contain an expression.");
    testIntegerLiteral(exprStmt.expression, 123);
});

Deno.test("Parser: successfully parses multiple integer literal statements", () => {
    const input = `
5
10
99
`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 3, `Expected 3 statements, got ${program.statements.length}`);

    // Verify each statement
    testIntegerLiteral((program.statements[0] as ExpressionStatement).expression!, 5);
    testIntegerLiteral((program.statements[1] as ExpressionStatement).expression!, 10);
    testIntegerLiteral((program.statements[2] as ExpressionStatement).expression!, 99);
});

Deno.test("Parser: successfully parses single float literal statement", () => {
    const input = `3.14`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 1);

    const statement = program.statements[0];
    assertEquals(statement.type, "ExpressionStatement");

    const exprStmt = statement as ExpressionStatement;
    assertExists(exprStmt.expression);
    testFloatLiteral(exprStmt.expression, 3.14);
});

Deno.test("Parser: successfully parses mixed integer and float literal statements", () => {
    const input = `
1.0
2
3.14159
42
`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 4);

    // FIX CALLS HERE: Pass the exact string literal expected for floats
    testFloatLiteral((program.statements[0] as ExpressionStatement).expression!, 1.0, "1.0");
    testIntegerLiteral((program.statements[1] as ExpressionStatement).expression!, 2);
    testFloatLiteral((program.statements[2] as ExpressionStatement).expression!, 3.14159, "3.14159");
    testIntegerLiteral((program.statements[3] as ExpressionStatement).expression!, 42);
});

Deno.test("Parser: handles program with only newlines", () => {
    const input = `

`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser); // Should be no errors
    assertExists(program);
    assertEquals(program.statements.length, 0, "Expected no statements for a program with only newlines.");
});

Deno.test("Parser: handles empty program", () => {
    const input = ``;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 0, "Expected no statements for an empty program.");
});

// String literal tests
Deno.test("Parser: successfully parses single string literal statement", () => {
    const input = `"hello world"`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 1);

    const statement = program.statements[0] as ExpressionStatement;
    assertExists(statement.expression);
    testStringLiteral(statement.expression, "hello world");
});

Deno.test("Parser: successfully parses empty string literal", () => {
    const input = `""`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 1);

    const statement = program.statements[0] as ExpressionStatement;
    assertExists(statement.expression);
    testStringLiteral(statement.expression, "");
});

Deno.test("Parser: successfully parses multiple string literal statements", () => {
    const input = `
"first"
"second"
"third with spaces"
`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 3);

    testStringLiteral((program.statements[0] as ExpressionStatement).expression!, "first");
    testStringLiteral((program.statements[1] as ExpressionStatement).expression!, "second");
    testStringLiteral((program.statements[2] as ExpressionStatement).expression!, "third with spaces");
});

// Boolean literal tests
Deno.test("Parser: successfully parses 'true' literal", () => {
    const input = `true`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 1);

    const statement = program.statements[0] as ExpressionStatement;
    assertExists(statement.expression);
    testBooleanLiteral(statement.expression, true);
});

Deno.test("Parser: successfully parses 'false' literal", () => {
    const input = `false`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 1);

    const statement = program.statements[0] as ExpressionStatement;
    assertExists(statement.expression);
    testBooleanLiteral(statement.expression, false);
});

Deno.test("Parser: successfully parses mixed boolean literals", () => {
    const input = `
true
false
true
`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 3);

    testBooleanLiteral((program.statements[0] as ExpressionStatement).expression!, true);
    testBooleanLiteral((program.statements[1] as ExpressionStatement).expression!, false);
    testBooleanLiteral((program.statements[2] as ExpressionStatement).expression!, true);
});

// Mixed literal types tests
Deno.test("Parser: successfully parses mixed literal types", () => {
    const input = `
42
"hello"
true
3.14
false
"world"
`;
    const parser = new Parser(input);
    const program = parser.parseProgram();

    checkParserErrors(parser);
    assertExists(program);
    assertEquals(program.statements.length, 6);

    testIntegerLiteral((program.statements[0] as ExpressionStatement).expression!, 42);
    testStringLiteral((program.statements[1] as ExpressionStatement).expression!, "hello");
    testBooleanLiteral((program.statements[2] as ExpressionStatement).expression!, true);
    testFloatLiteral((program.statements[3] as ExpressionStatement).expression!, 3.14, "3.14");
    testBooleanLiteral((program.statements[4] as ExpressionStatement).expression!, false);
    testStringLiteral((program.statements[5] as ExpressionStatement).expression!, "world");
});

Deno.test("Parser: parses boolean prefix expression", () => {
    const input = `!true`;
    const parser = new Parser(input);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);
    assertExists(program);
    
    const stmt = program.statements[0] as ExpressionStatement;
    const exp = stmt.expression as PrefixExpression;
    
    assertEquals(exp.operator, "!");
    assertEquals(exp.right.type, "BooleanLiteral");
    assertEquals((exp.right as BooleanLiteral).value, true);
});

Deno.test("Parser: parses numeric prefix expression", () => {
    const input = `-3.14`;
    const parser = new Parser(input);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);
    assertExists(program);
    
    const stmt = program.statements[0] as ExpressionStatement;
    const exp = stmt.expression as PrefixExpression;
    
    assertEquals(exp.operator, "-");
    assertEquals(exp.right.type, "FloatLiteral");
    assertEquals((exp.right as FloatLiteral).value, 3.14);
});

Deno.test("Parser: handles nested prefix expressions", () => {
    const input = `!!true`;
    const parser = new Parser(input);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);
    
    const stmt = program!.statements[0] as ExpressionStatement;
    const outer = stmt.expression as PrefixExpression;
    const inner = outer.right as PrefixExpression;
    const bool = inner.right as BooleanLiteral;
    
    assertEquals(outer.operator, "!");
    assertEquals(inner.operator, "!");
    assertEquals(bool.value, true);
});

Deno.test("Parser: handles numeric negation", () => {
    const input = `-42`;
    const parser = new Parser(input);
    const program = parser.parseProgram();
    
    checkParserErrors(parser);
    
    const stmt = program!.statements[0] as ExpressionStatement;
    const exp = stmt.expression as PrefixExpression;
    const literal = exp.right as IntegerLiteral;
    
    assertEquals(exp.operator, "-");
    assertEquals(literal.value, 42);
});