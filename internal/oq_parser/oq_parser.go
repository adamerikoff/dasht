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

var precedences = map[oq_token.TokenType]int{
	oq_token.EQUAL:     EQUALS,
	oq_token.NOT_EQUAL: EQUALS,
	oq_token.LESS:      LESSGREATER,
	oq_token.GREATER:   LESSGREATER,
	oq_token.PLUS:      SUM,
	oq_token.MINUS:     SUM,
	oq_token.SLASH:     PRODUCT,
	oq_token.STAR:      PRODUCT,
	oq_token.LPAREN:    CALL,
}

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
	p.registerPrefix(oq_token.IDENTIFIER, p.parseIdentifier)
	p.registerPrefix(oq_token.INTEGER, p.parseIntegerLiteral)
	p.registerPrefix(oq_token.FLOAT, p.parseFloatLiteral)
	p.registerPrefix(oq_token.EXCLAMATION, p.parsePrefixExpression)
	p.registerPrefix(oq_token.MINUS, p.parsePrefixExpression)
	p.registerPrefix(oq_token.TILDE, p.parsePrefixExpression)
	p.registerPrefix(oq_token.TRUE, p.parseBoolean)
	p.registerPrefix(oq_token.FALSE, p.parseBoolean)
	p.registerPrefix(oq_token.LPAREN, p.parseGroupedExpression)
	p.registerPrefix(oq_token.IF, p.parseIfExpression)
	p.registerPrefix(oq_token.FUNCTION, p.parseFunctionLiteral)

	p.infixParseFunctions = make(map[oq_token.TokenType]infixParseFunction)
	p.registerInfix(oq_token.PLUS, p.parseInfixExpression)
	p.registerInfix(oq_token.MINUS, p.parseInfixExpression)
	p.registerInfix(oq_token.SLASH, p.parseInfixExpression)
	p.registerInfix(oq_token.STAR, p.parseInfixExpression)
	p.registerInfix(oq_token.EQUAL, p.parseInfixExpression)
	p.registerInfix(oq_token.NOT_EQUAL, p.parseInfixExpression)
	p.registerInfix(oq_token.LESS, p.parseInfixExpression)
	p.registerInfix(oq_token.GREATER, p.parseInfixExpression)
	p.registerInfix(oq_token.LPAREN, p.parseCallExpression)

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

func (p *Parser) peekPrecedence() int {
	if p, ok := precedences[p.peekToken.Type]; ok {
		return p
	}

	return LOWEST
}

func (p *Parser) curPrecedence() int {
	if p, ok := precedences[p.currentToken.Type]; ok {
		return p
	}

	return LOWEST
}

func (p *Parser) peekError(t oq_token.TokenType) {
	msg := fmt.Sprintf("expected next token to be %s, got %s instead", t, p.peekToken.Type)
	p.errors = append(p.errors, msg)
}

func (p *Parser) noPrefixParseFnError(t oq_token.TokenType) {
	msg := fmt.Sprintf("no prefix parse function for %s found", t)
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

	p.nextToken()

	statement.Value = p.parseExpression(LOWEST)

	for !p.currentTokenIs(oq_token.NEW_LINE) {
		p.nextToken()
	}

	return statement
}

func (p *Parser) parseReturnStatement() *oq_ast.ReturnStatement {
	statement := &oq_ast.ReturnStatement{Token: p.currentToken}

	p.nextToken()

	statement.ReturnValue = p.parseExpression(LOWEST)

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
		p.noPrefixParseFnError(p.currentToken.Type)
		return nil
	}
	leftExp := prefix()

	for !p.peekTokenIs(oq_token.NEW_LINE) && precedence < p.peekPrecedence() {
		infix := p.infixParseFunctions[p.peekToken.Type]
		if infix == nil {
			return leftExp
		}

		p.nextToken()

		leftExp = infix(leftExp)
	}

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

func (p *Parser) parsePrefixExpression() oq_ast.Expression {
	expression := &oq_ast.PrefixExpression{
		Token:    p.currentToken,
		Operator: p.currentToken.Literal,
	}

	p.nextToken()

	expression.Right = p.parseExpression(PREFIX)

	return expression
}

func (p *Parser) parseInfixExpression(left oq_ast.Expression) oq_ast.Expression {
	expression := &oq_ast.InfixExpression{
		Token:    p.currentToken,
		Operator: p.currentToken.Literal,
		Left:     left,
	}

	precedence := p.curPrecedence()
	p.nextToken()
	expression.Right = p.parseExpression(precedence)

	return expression
}

func (p *Parser) parseBoolean() oq_ast.Expression {
	return &oq_ast.Boolean{Token: p.currentToken, Value: p.currentTokenIs(oq_token.TRUE)}
}

func (p *Parser) parseGroupedExpression() oq_ast.Expression {
	p.nextToken()

	exp := p.parseExpression(LOWEST)
	if !p.expectPeek(oq_token.RPAREN) {
		return nil
	}

	return exp
}

func (p *Parser) parseBlockStatement() *oq_ast.BlockStatement {
	block := &oq_ast.BlockStatement{Token: p.currentToken}

	block.Statements = []oq_ast.Statement{}

	p.nextToken()

	for !p.currentTokenIs(oq_token.RBRACE) && !p.currentTokenIs(oq_token.EOF) {
		statement := p.parseStatement()
		if statement != nil {
			block.Statements = append(block.Statements, statement)
		}
		p.nextToken()
	}

	return block
}

func (p *Parser) parseIfExpression() oq_ast.Expression {
	expression := &oq_ast.IfExpression{Token: p.currentToken}
	if !p.expectPeek(oq_token.LPAREN) {
		return nil
	}

	p.nextToken()
	expression.Condition = p.parseExpression(LOWEST)

	if !p.expectPeek(oq_token.RPAREN) {
		return nil
	}

	if !p.expectPeek(oq_token.LBRACE) {
		return nil
	}

	expression.Consequence = p.parseBlockStatement()

	if p.peekTokenIs(oq_token.ELSE) {
		p.nextToken()

		if !p.expectPeek(oq_token.LBRACE) {
			return nil
		}

		expression.Alternative = p.parseBlockStatement()
	}

	return expression
}

func (p *Parser) parseFunctionParameters() []*oq_ast.Identifier {
	identifiers := []*oq_ast.Identifier{}

	if p.peekTokenIs(oq_token.RPAREN) {
		p.nextToken()
		return identifiers
	}

	p.nextToken()

	ident := &oq_ast.Identifier{Token: p.currentToken, Value: p.currentToken.Literal}
	identifiers = append(identifiers, ident)

	for p.peekTokenIs(oq_token.COMMA) {
		p.nextToken()
		p.nextToken()
		ident := &oq_ast.Identifier{Token: p.currentToken, Value: p.currentToken.Literal}
		identifiers = append(identifiers, ident)
	}

	if !p.expectPeek(oq_token.RPAREN) {
		return nil
	}

	return identifiers
}

func (p *Parser) parseFunctionLiteral() oq_ast.Expression {
	lit := &oq_ast.FunctionLiteral{Token: p.currentToken}

	if !p.expectPeek(oq_token.LPAREN) {
		return nil
	}

	lit.Parameters = p.parseFunctionParameters()
	if !p.expectPeek(oq_token.LBRACE) {
		return nil
	}

	lit.Body = p.parseBlockStatement()

	return lit
}

func (p *Parser) parseCallExpression(function oq_ast.Expression) oq_ast.Expression {
	exp := &oq_ast.CallExpression{Token: p.currentToken, Function: function}
	exp.Arguments = p.parseCallArguments()
	return exp
}

func (p *Parser) parseCallArguments() []oq_ast.Expression {
	args := []oq_ast.Expression{}

	if p.peekTokenIs(oq_token.RPAREN) {
		p.nextToken()
		return args
	}

	p.nextToken()
	args = append(args, p.parseExpression(LOWEST))

	for p.peekTokenIs(oq_token.COMMA) {
		p.nextToken()
		p.nextToken()
		args = append(args, p.parseExpression(LOWEST))
	}

	if !p.expectPeek(oq_token.RPAREN) {
		return nil
	}

	return args
}
