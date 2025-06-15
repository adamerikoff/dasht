// src/lexer/keywords.ts

import { TokenType, KeywordInfo } from "./token.ts";

// A map to quickly look up if an identifier is a reserved keyword
export const base_keywords: { [key: string]: KeywordInfo } = {
    "fn": { type: TokenType.FUNCTION, baseLiteral: "fn" },
    "let": { type: TokenType.LET, baseLiteral: "let" },
    "true": { type: TokenType.TRUE, baseLiteral: "true" },
    "false": { type: TokenType.FALSE, baseLiteral: "false" },
    "if": { type: TokenType.IF, baseLiteral: "if" },
    "else": { type: TokenType.ELSE, baseLiteral: "else" },
    "elsif": { type: TokenType.ELSIF, baseLiteral: "elsif" },
    "return": { type: TokenType.RETURN, baseLiteral: "return" },
    "and": { type: TokenType.AND, baseLiteral: "and" },
    "or": { type: TokenType.OR, baseLiteral: "or" },
    "for": { type: TokenType.FOR, baseLiteral: "for" },
    "while": { type: TokenType.WHILE, baseLiteral: "while" },
};

// Kazakh keywords (QZ)
export const qzq_keywords: { [key: string]: KeywordInfo } = {
    "фн": { type: TokenType.FUNCTION, baseLiteral: "fn" },
    "болсын": { type: TokenType.LET, baseLiteral: "let" },
    "шын": { type: TokenType.TRUE, baseLiteral: "true" },
    "жалған": { type: TokenType.FALSE, baseLiteral: "false" },
    "егер": { type: TokenType.IF, baseLiteral: "if" },
    "әйтпесе": { type: TokenType.ELSE, baseLiteral: "else" },
    "егер_әйтпесе": { type: TokenType.ELSIF, baseLiteral: "elsif" },
    "қайтару": { type: TokenType.RETURN, baseLiteral: "return" },
    "және": { type: TokenType.AND, baseLiteral: "and" },
    "немесе": { type: TokenType.OR, baseLiteral: "or" },
    "үшін": { type: TokenType.FOR, baseLiteral: "for" },
    "уақытша": { type: TokenType.WHILE, baseLiteral: "while" },
};

// Turkish keywords (TRK)
export const trk_keywords: { [key: string]: KeywordInfo } = {
    "fn": { type: TokenType.FUNCTION, baseLiteral: "fn" },
    "olsun": { type: TokenType.LET, baseLiteral: "let" },
    "doğru": { type: TokenType.TRUE, baseLiteral: "true" },
    "yanlış": { type: TokenType.FALSE, baseLiteral: "false" },
    "eğer": { type: TokenType.IF, baseLiteral: "if" },
    "yoksa": { type: TokenType.ELSE, baseLiteral: "else" },
    "yok_eğer": { type: TokenType.ELSIF, baseLiteral: "elsif" },
    "döndür": { type: TokenType.RETURN, baseLiteral: "return" },
    "ve": { type: TokenType.AND, baseLiteral: "and" },
    "veya": { type: TokenType.OR, baseLiteral: "or" },
    "için": { type: TokenType.FOR, baseLiteral: "for" },
    "iken": { type: TokenType.WHILE, baseLiteral: "while" },
};