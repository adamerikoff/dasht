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
    InfixExpression,
} from "../ast/mod.ts";

export class Parser {
       
}