// src/lexer/token.ts

export enum TokenType {
    ILLEGAL = "ILLEGAL",
    NEWLINE = "NEWLINE",
    EOF = "EOF",

    // Identifiers + literals
    IDENTIFIER = "IDENTIFIER",
    INTEGER = "INTEGER",
    FLOAT = "FLOAT",
    STRING = "STRING",

    // Operators
    ASSIGN = "=",
    PLUS = "+",
    MINUS = "-",
    BANG = "!",
    ASTERISK = "*",
    SLASH = "/",
    LT = "<",
    GT = ">",
    EQ = "==",
    NOT_EQ = "!=",
    LTE = "<=",
    GTE = ">=",

    // Delimiters
    COMMA = ",",
    LPAREN = "(",
    RPAREN = ")",
    LBRACE = "{",
    RBRACE = "}",
    LBRACKET = "[",
    RBRACKET = "]",

    // Keywords
    FUNCTION = "FUNCTION",
    LET = "LET",
    TRUE = "TRUE",
    FALSE = "FALSE",
    IF = "IF",
    ELSE = "ELSE",
    ELSIF = "ELSIF",
    RETURN = "RETURN",
    AND = "AND",
    OR = "OR",
    FOR = "FOR",
    WHILE = "WHILE"
}

// Interface to store keyword information
export interface KeywordInfo {
    type: TokenType;
    baseLiteral: string; // The unified/base literal for this keyword
}

export interface Token {
    type: TokenType;
    literal: string;
    line: number;      // The line number where the token starts
    column: number;    // The column number where the token starts
}
