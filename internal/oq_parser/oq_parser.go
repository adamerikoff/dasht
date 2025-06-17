package oq_parser

import (
	"fmt"
	"strconv"

	"github.com/adamerikoff/oq/internal/oq_ast"
	"github.com/adamerikoff/oq/internal/oq_lexer"
	"github.com/adamerikoff/oq/internal/oq_token"
)

const (
	_ int = iota
	LOWEST
	EQUALS      // ==
	LESSGREATER // > or <
	SUM         // +
	PRODUCT     // *
	PREFIX      // -X or !X
	CALL        // myFunction(X)
)

type (
	prefixParseFunction func() oq_ast.Expression
	infixParseFunction  func(oq_ast.Expression) oq_ast.Expression
)

type Parser struct {
	l            *oq_lexer.Lexer
	currentToken oq_token.Token
	peekToken    oq_token.Token
	errors       []string

	prefixParseFunctions map[oq_token.TokenType]prefixParseFunction
	infixParseFunctions  map[oq_token.TokenType]infixParseFunction
}

func New(l *oq_lexer.Lexer) *Parser {
	p := &Parser{
		l:      l,
		errors: []string{},
	}

	p.registerParsingFunctions()

	// Read two tokens, so curToken and peekToken are both set
	p.nextToken()
	p.nextToken()

	return p
}

func (p *Parser) registerParsingFunctions() {
	p.prefixParseFunctions = make(map[oq_token.TokenType]prefixParseFunction)
	p.infixParseFunctions = make(map[oq_token.TokenType]infixParseFunction)

	p.registerPrefix(oq_token.IDENTIFIER, p.parseIdentifier)
	p.registerPrefix(oq_token.INTEGER, p.parseIntegerLiteral)
	p.registerPrefix(oq_token.FLOAT, p.parseFloatLiteral)
}

func (p *Parser) registerPrefix(tokenType oq_token.TokenType, fn prefixParseFunction) {
	p.prefixParseFunctions[tokenType] = fn
}

func (p *Parser) registerInfix(tokenType oq_token.TokenType, fn infixParseFunction) {
	p.infixParseFunctions[tokenType] = fn
}

func (p *Parser) Errors() []string {
	return p.errors
}

func (p *Parser) peekError(t oq_token.TokenType) {
	msg := fmt.Sprintf("expected next token to be %s, got %s instead", t, p.peekToken.Type)
	p.errors = append(p.errors, msg)
}

func (p *Parser) expectPeek(t oq_token.TokenType) bool {
	if p.peekTokenIs(t) {
		p.nextToken()
		return true
	} else {
		p.peekError(t)
		return false
	}
}

func (p *Parser) nextToken() {
	p.currentToken = p.peekToken
	p.peekToken = p.l.NextToken()
}

func (p *Parser) currentTokenIs(t oq_token.TokenType) bool {
	return p.currentToken.Type == t
}

func (p *Parser) peekTokenIs(t oq_token.TokenType) bool {
	return p.peekToken.Type == t
}

func (p *Parser) ParseProgram() *oq_ast.Program {
	program := &oq_ast.Program{}
	program.Statements = []oq_ast.Statement{}

	for p.currentToken.Type != oq_token.EOF {
		statement := p.parseStatement()
		if statement != nil {
			program.Statements = append(program.Statements, statement)
		}
		p.nextToken()
	}

	return program
}

func (p *Parser) parseStatement() oq_ast.Statement {
	switch p.currentToken.Type {
	case oq_token.LET:
		return p.parseLetStatement()
	case oq_token.RETURN:
		return p.parseReturnStatement()
	default:
		return p.parseExpressionStatement()
	}
}

func (p *Parser) parseLetStatement() *oq_ast.LetStatement {
	statement := &oq_ast.LetStatement{Token: p.currentToken}

	if !p.expectPeek(oq_token.IDENTIFIER) {
		return nil
	}

	statement.Name = &oq_ast.Identifier{Token: p.currentToken, Value: p.currentToken.Literal}

	if !p.expectPeek(oq_token.ASSIGN) {
		return nil
	}

	// TODO: We're skipping the expressions until we
	// encounter a semicolon
	for !p.currentTokenIs(oq_token.NEW_LINE) {
		p.nextToken()
	}

	return statement
}

func (p *Parser) parseReturnStatement() *oq_ast.ReturnStatement {
	statement := &oq_ast.ReturnStatement{Token: p.currentToken}

	p.nextToken()

	// TODO: We're skipping the expressions until we
	// encounter a semicolon
	for !p.currentTokenIs(oq_token.NEW_LINE) {
		p.nextToken()
	}

	return statement
}

func (p *Parser) parseExpressionStatement() *oq_ast.ExpressionStatement {
	statement := &oq_ast.ExpressionStatement{Token: p.currentToken}

	statement.Expression = p.parseExpression(LOWEST)

	if p.peekTokenIs(oq_token.NEW_LINE) {
		p.nextToken()
	}

	return statement
}

func (p *Parser) parseExpression(precedence int) oq_ast.Expression {
	prefix := p.prefixParseFunctions[p.currentToken.Type]
	if prefix == nil {
		return nil
	}
	leftExp := prefix()

	return leftExp
}

func (p *Parser) parseIdentifier() oq_ast.Expression {
	return &oq_ast.Identifier{Token: p.currentToken, Value: p.currentToken.Literal}
}

func (p *Parser) parseIntegerLiteral() oq_ast.Expression {
	lit := &oq_ast.IntegerLiteral{Token: p.currentToken}

	value, err := strconv.ParseInt(p.currentToken.Literal, 0, 64)

	if err != nil {
		msg := fmt.Sprintf("could not parse %q as integer", p.currentToken.Literal)
		p.errors = append(p.errors, msg)
		return nil
	}

	lit.Value = value

	return lit
}

func (p *Parser) parseFloatLiteral() oq_ast.Expression {
	lit := &oq_ast.FloatLiteral{Token: p.currentToken}

	value, err := strconv.ParseFloat(p.currentToken.Literal, 64)

	if err != nil {
		msg := fmt.Sprintf("could not parse %q as float", p.currentToken.Literal)
		p.errors = append(p.errors, msg)
		return nil
	}

	lit.Value = value

	return lit
}
