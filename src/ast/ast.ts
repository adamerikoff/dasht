import { TokenType } from "../lexer/token.ts";

// --- Base Node Interfaces ---
// Every node in the AST will implement ASTNode to have a 'type' property
// for easy identification and a 'token' property for source location mapping.
export interface ASTNode {
    type: string; // Discriminator for TypeScript union types, e.g., "LetStatement", "Identifier"
    token?: { literal: string; line: number; column: number }; // The primary token that generated this node, useful for debugging and error reporting
}

// --- Statement Nodes ---
// Statements are chunks of code that perform actions. They don't evaluate to a value.
export interface Statement extends ASTNode {
    // Union of all possible statement types
    type: "Program" | "LetStatement" | "ReturnStatement" | "ExpressionStatement" | "BlockStatement" | "IfStatement" | "FunctionDeclaration" | "ForStatement" | "WhileStatement";
}

// --- Expression Nodes ---
// Expressions are chunks of code that evaluate to a value.
export interface Expression extends ASTNode {
    // Union of all possible expression types
    type: "Identifier" | "IntegerLiteral" | "FloatLiteral" | "StringLiteral" | "BooleanLiteral" | "PrefixExpression" | "InfixExpression" | "CallExpression" | "GroupedExpression";
    // Add more as your language grows: "ArrayLiteral", "IndexExpression", "ObjectLiteral", etc.
}

// --- Program Node (The Root of the AST) ---
export interface Program extends Statement {
    type: "Program";
    statements: Statement[]; // A program is a sequence of statements
}

// --- Specific Statement Node Definitions ---

// Example: `let myVar = 10`
export interface LetStatement extends Statement {
    type: "LetStatement";
    name: Identifier; // The identifier being declared
    value: Expression; // The expression whose value is assigned to the identifier
}

// Example: `return x + y`
export interface ReturnStatement extends Statement {
    type: "ReturnStatement";
    returnValue: Expression; // The expression to be returned
}

// Example: `x + 5` (an expression used as a statement)
export interface ExpressionStatement extends Statement {
    type: "ExpressionStatement";
    expression: Expression; // The expression itself
}

// Example: `{ statement1 statement2 }`
export interface BlockStatement extends Statement {
    type: "BlockStatement";
    statements: Statement[]; // A block contains a list of statements
}

// Example: `if (x > 0) { ... } else { ... }` or `elsif (y < 0) { ... }`
export interface IfStatement extends Statement {
    type: "IfStatement";
    condition: Expression; // The condition to evaluate
    consequence: BlockStatement; // The block to execute if the condition is true
    alternative?: BlockStatement; // Optional: The block for 'else' or 'elsif'
}

// Example: `fn add(a, b) { ... }`
export interface FunctionDeclaration extends Statement {
    type: "FunctionDeclaration";
    name: Identifier; // The function's name
    parameters: Identifier[]; // List of parameter identifiers
    body: BlockStatement; // The function's code block
}

// Example: `for (let i = 0, i < 10, i = i + 1) { ... }`
export interface ForStatement extends Statement {
    type: "ForStatement";
    initializer?: Statement; // e.g., 'let i = 0;'
    condition?: Expression; // e.g., 'i < 10'
    incrementor?: ExpressionStatement; // e.g., 'i = i + 1'
    body: BlockStatement;
}

// Example: `while (x > 0) { ... }`
export interface WhileStatement extends Statement {
    type: "WhileStatement";
    condition: Expression;
    body: BlockStatement;
}

// --- Specific Expression Node Definitions ---

// Example: `myVariable`
export interface Identifier extends Expression {
    type: "Identifier";
    value: string; // The name of the identifier
}

// Example: `123`
export interface IntegerLiteral extends Expression {
    type: "IntegerLiteral";
    value: number; // The numeric value
}

// Example: `3.14`
export interface FloatLiteral extends Expression {
    type: "FloatLiteral";
    value: number; // The numeric value
}

// Example: `"hello world"`
export interface StringLiteral extends Expression {
    type: "StringLiteral";
    value: string; // The string content
}

// Example: `true`, `false`
export interface BooleanLiteral extends Expression {
    type: "BooleanLiteral";
    value: boolean; // `true` or `false`
}

// Example: `-x`, `!isTrue`
export interface PrefixExpression extends Expression {
    type: "PrefixExpression";
    operator: string; // The operator (e.g., "-", "!")
    right: Expression; // The expression the operator applies to
}

// Example: `a + b`, `x == y`
export interface InfixExpression extends Expression {
    type: "InfixExpression";
    left: Expression; // The left operand
    operator: string; // The operator (e.g., "+", "==", ">")
    right: Expression; // The right operand
}

// Example: `myFunction(arg1, arg2)`
export interface CallExpression extends Expression {
    type: "CallExpression";
    function: Identifier | Expression; // The function being called (could be an identifier or a more complex expression like `obj.method`)
    arguments: Expression[]; // List of arguments passed to the function
}

// Example: `(1 + 2) * 3`
export interface GroupedExpression extends Expression {
    type: "GroupedExpression";
    expression: Expression; // The expression inside the parentheses
}