// src/lexer/token.ts

export enum TokenType {
    ILLEGAL = "ILLEGAL",
    NEWLINE = "NEWLINE",
    EOF = "END_OF_FILE",

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

export interface Token {
    type: TokenType;
    literal: string;
    line: number;      // The line number where the token starts
    column: number;    // The column number where the token starts
}

// A map to quickly look up if an identifier is a reserved keyword
export const keywords: { [key: string]: TokenType } = {
    "fn": TokenType.FUNCTION,
    "let": TokenType.LET,
    "true": TokenType.TRUE,
    "false": TokenType.FALSE,
    "if": TokenType.IF,
    "else": TokenType.ELSE,
    "elsif": TokenType.ELSIF,
    "return": TokenType.RETURN,
    "and": TokenType.AND,
    "or": TokenType.OR,
    "for": TokenType.FOR,
    "while": TokenType.WHILE,
};
