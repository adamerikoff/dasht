import { Lexer } from "../lexer/lexer.ts";
import { Token, TokenType } from "../lexer/token.ts";
import { base_keywords, qzq_keywords, trk_keywords } from "../lexer/keywords.ts";
import { ParserError } from "./errors.ts";
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
    PrefixExpression,
} from "../ast/mod.ts";

export enum Precedence {
    LOWEST = 1,
    EQUALS = 2,       // ==
    LESSGREATER = 3,  // > or <
    SUM = 4,          // +
    PRODUCT = 5,      // *
    PREFIX = 6,       // -X or !X
    CALL = 7          // myFunction(X)
}

const precedences: { [key in TokenType]?: Precedence } = {};

type PrefixParseFn = () => Expression | null;

export class Parser {
    lexer: Lexer;
    currentToken: Token;
    peekToken: Token; // For one-token lookahead
    errors: ParserError[] = []; // List to collect parsing errors
    prefixParseFns = new Map<TokenType, PrefixParseFn>();
    // infixParseFns = new Map<TokenType, InfixParseFn>();
    // currentParsingMode;

    constructor(input: string) {
        this.lexer = new Lexer(input, base_keywords);
        this.currentToken = this.lexer.nextToken();
        this.peekToken = this.lexer.nextToken();

        this.registerParsingFunctions();
    }

    /** Registers parsing functions. Only `parseIntegerLiteral` for now. */
    private registerParsingFunctions(): void {
        this.registerPrefix(TokenType.INTEGER, this.parseIntegerLiteral);
        this.registerPrefix(TokenType.FLOAT, this.parseFloatLiteral);
        this.registerPrefix(TokenType.STRING, this.parseStringLiteral);
        this.registerPrefix(TokenType.TRUE, this.parseBooleanLiteral);
        this.registerPrefix(TokenType.FALSE, this.parseBooleanLiteral);
        this.registerPrefix(TokenType.BANG, this.parsePrefixBooleanExpression);
        this.registerPrefix(TokenType.MINUS, this.parsePrefixNumericExpression);
    }

    // --- Token Management Helper Methods ---

    /** Advances `currentToken` to `peekToken`, and then fetches a new `peekToken`. */
    private nextToken(): void {
        this.currentToken = this.peekToken;
        this.peekToken = this.lexer.nextToken();
    }

    /** Returns true if `currentToken.type` matches `type`. */
    private currentTokenIs(type: TokenType): boolean {
        return this.currentToken.type === type;
    }

    /** Returns true if `peekToken.type` matches `type`. */
    private peekTokenIs(type: TokenType): boolean {
        return this.peekToken.type === type;
    }

    /**
     * Consumes the current token if its type matches `expectedType`.
     * If not, records a parser error.
     * @returns True if the token matched and was consumed, false otherwise.
     */
    private expect(expectedType: TokenType): boolean {
        if (this.currentToken.type === expectedType) {
            this.nextToken();
            return true;
        } else {
            this.addError(`Expected '${(TokenType as any)[expectedType]}', but got '${(TokenType as any)[this.currentToken.type]}' ('${this.currentToken.literal}')`, this.currentToken);
            return false;
        }
    }


    private peekPrecedence(): Precedence {
        return precedences[this.peekToken.type] || Precedence.LOWEST;
    }

    private currentPrecedence(): Precedence {
        return precedences[this.currentToken.type] || Precedence.LOWEST;
    }

    /** Records a parser error. */
    private addError(message: string, token: Token): void {
        this.errors.push(new ParserError(message, token.line, token.column));
    }

    /** Returns all collected parser errors. */
    public getErrors(): ParserError[] {
        return this.errors;
    }

    // --- Expression Parsing Function Registration ---

    private registerPrefix(tokenType: TokenType, fn: PrefixParseFn): void {
        this.prefixParseFns.set(tokenType, fn.bind(this));
    }

    private noPrefixParseFnError(tokenType: TokenType): void {
        this.addError(`No prefix parse function registered for '${(TokenType as any)}' ('${this.currentToken.literal}').`, this.currentToken);
    }

    // --- Main Parsing Method ---

    /**
     * Parses the entire program from the input.
     * Currently, only handles integer literal expression statements.
     * @returns The root `Program` AST node or `null` if critical errors occurred.
     */
    public parseProgram(): Program | null {
        const program: Program = {
            type: "Program",
            statements: [],
            token: { literal: "Program", line: 1, column: 1 }
        };

        // Dialect handling removed for simplicity

        // Parse statements until End Of File
        while (this.currentToken.type !== TokenType.EOF) {
            // Skip empty lines (multiple NEWLINE tokens)
            if (this.currentTokenIs(TokenType.NEWLINE)) {
                this.nextToken();
                continue;
            }

            const statement = this.parseStatement();
            if (statement) {
                program.statements.push(statement);
            } else {
                // Simple error recovery: skip tokens until a newline or end of file
                this.addError(`Failed to parse statement. Attempting error recovery.`, this.currentToken);
                while (!this.currentTokenIs(TokenType.NEWLINE) && !this.currentTokenIs(TokenType.EOF)) {
                    this.nextToken();
                }
            }

            // Consume trailing newline after a statement (if not already consumed)
            if (this.currentTokenIs(TokenType.NEWLINE)) {
                this.expect(TokenType.NEWLINE);
            } else if (!this.currentTokenIs(TokenType.EOF) && statement) {
                // Error if a statement isn't followed by a newline or EOF
                this.addError(`Expected NEWLINE or EOF after statement. Found '${this.currentToken.literal}'.`, this.currentToken);
                this.nextToken();
            }
        }

        if (this.errors.length > 0) {
            console.error("Parsing finished with errors:");
            this.errors.forEach(err => console.error(`  - ${err.message} (Line: ${err.line}, Col: ${err.column})`));
            return null;
        }

        return program;
    }

    // --- Statement Parsing Methods ---

    /**
     * Parses a statement. Only expression statements are supported.
     * @returns A Statement AST node or `null`.
     */
    private parseStatement(): Statement | null {
        // For now, every token starting a statement is an expression statement
        return this.parseExpressionStatement();
    }

    /** Parses an expression statement: `<INTEGER_LITERAL>;` */
    private parseExpressionStatement(): ExpressionStatement | null {
        const expression = this.parseExpression(Precedence.LOWEST);
        if (!expression) return null;

        return {
            type: "ExpressionStatement",
            token: { literal: expression.token!.literal, line: expression.token!.line, column: expression.token!.column },
            expression
        };
    }

    // --- Core Expression Parsing ---

    private parseExpression(precedence: Precedence): Expression | null {
        const prefixFn = this.prefixParseFns.get(this.currentToken.type);
        if (!prefixFn) {
            this.noPrefixParseFnError(this.currentToken.type);
            return null;
        }

        let leftExp = prefixFn();
        
        // // Add this while loop for infix expressions later
        // while (!this.peekTokenIs(TokenType.NEWLINE) && 
        //     precedence < this.peekPrecedence()) {
        //     const infixFn = this.infixParseFns.get(this.peekToken.type);
        //     if (!infixFn) return leftExp;
            
        //     this.nextToken();
        //     leftExp = infixFn(leftExp!);
        // }
        
        return leftExp;
    }

    // --- Specific Literal Expression Parsing Functions (only Integer) ---

    /** Parses an Integer Literal expression. */
    private parseIntegerLiteral(): IntegerLiteral | null {
        const token = this.currentToken;
        if (!this.expect(TokenType.INTEGER)) return null;

        const value = parseInt(token.literal, 10);
        if (isNaN(value)) {
            this.addError(`Could not parse '${token.literal}' as an integer.`, token);
            return null;
        }
        return {
            type: "IntegerLiteral",
            token: { literal: token.literal, line: token.line, column: token.column },
            value
        };
    }

    /** Parses a Float Literal expression. */
    private parseFloatLiteral(): FloatLiteral | null {
        const token = this.currentToken;
        if (!this.expect(TokenType.FLOAT)) return null;

        const value = parseFloat(token.literal);
        if (isNaN(value)) {
            this.addError(`Could not parse '${token.literal}' as an integer.`, token);
            return null;
        }
        return {
            type: "FloatLiteral",
            token: { literal: token.literal, line: token.line, column: token.column },
            value
        };
    }

    /** Parses a String Literal expression. */
    private parseStringLiteral(): StringLiteral | null {
        const token = this.currentToken;
        if (!this.expect(TokenType.STRING)) return null;

        // Remove the surrounding quotes
        const value = token.literal.slice(1, -1);
        return {
            type: "StringLiteral",
            token: { 
                literal: token.literal, // Keep original with quotes
                line: token.line, 
                column: token.column 
            },
            value // Store just the content
        };
    }

    private parsePrefixBooleanExpression(): PrefixExpression | null {
        const token = this.currentToken;
        if (!this.expect(TokenType.BANG)) return null;
        
        const right = this.parseExpression(Precedence.PREFIX);
        if (!right) return null;
        
        return {
            type: "PrefixExpression",
            token,
            operator: "!",
            right
        };
    }

    private parsePrefixNumericExpression(): PrefixExpression | null {
        const token = this.currentToken;
        if (!this.expect(TokenType.MINUS)) return null;
        
        const right = this.parseExpression(Precedence.PREFIX);
        if (!right) return null;
        
        if (right.type !== "IntegerLiteral" && right.type !== "FloatLiteral") {
            this.addError(`Expected numeric expression after '-', got ${right.type}`, token);
            return null;
        }
        
        return {
            type: "PrefixExpression",
            token,
            operator: "-",
            right
        };
    }

    /** Parses a Boolean Literal expression. */
    private parseBooleanLiteral(): BooleanLiteral | null {
        const token = this.currentToken;
        let value: boolean;
        
        if (token.type === TokenType.TRUE) {
            value = true;
        } else if (token.type === TokenType.FALSE) {
            value = false;
        } else {
            this.addError(`Expected boolean literal but got '${token.literal}'`, token);
            return null;
        }

        this.nextToken(); // Consume the boolean token
        return {
            type: "BooleanLiteral",
            token: { literal: token.literal, line: token.line, column: token.column },
            value
        };
    }
    
}