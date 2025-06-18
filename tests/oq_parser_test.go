package tests

import (
	"fmt"
	"testing"

	"github.com/adamerikoff/oq/internal/oq_ast"
	"github.com/adamerikoff/oq/internal/oq_lexer"
	"github.com/adamerikoff/oq/internal/oq_parser"
	"github.com/adamerikoff/oq/internal/oq_token"
)

func checkParserErrors(t *testing.T, p *oq_parser.Parser) {
	errors := p.Errors()
	if len(errors) == 0 {
		return
	}
	t.Errorf("parser has %d errors", len(errors))
	for _, msg := range errors {
		t.Errorf("parser error: %q", msg)
	}
	t.FailNow()
}

func testLetStatement(t *testing.T, s oq_ast.Statement, name string) bool {
	if s.TokenLiteral() != "let" {
		t.Errorf("s.TokenLiteral not 'let'. got=%q", s.TokenLiteral())
		return false
	}

	letStmt, ok := s.(*oq_ast.LetStatement)
	if !ok {
		t.Errorf("s not *ast.LetStatement. got=%T", s)
		return false
	}

	if letStmt.Name.Value != name {
		t.Errorf("letStmt.Name.Value not '%s'. got=%s", name, letStmt.Name.Value)
		return false
	}

	if letStmt.Name.TokenLiteral() != name {
		t.Errorf("s.Name not '%s'. got=%s", name, letStmt.Name)
		return false
	}

	return true
}

func testIntegerLiteral(t *testing.T, il oq_ast.Expression, value int64) bool {
	integ, ok := il.(*oq_ast.IntegerLiteral)
	if !ok {
		t.Errorf("il not *ast.IntegerLiteral. got=%T", il)
		return false
	}

	if integ.Value != value {
		t.Errorf("integ.Value not %d. got=%d", value, integ.Value)
		return false
	}

	if integ.TokenLiteral() != fmt.Sprintf("%d", value) {
		t.Errorf("integ.TokenLiteral not %d. got=%s", value,
			integ.TokenLiteral())
		return false
	}

	return true
}

// testFloatLiteral is a helper to assert on FloatLiteral nodes.
func testFloatLiteral(t *testing.T, exp oq_ast.Expression, value float64, literal string) bool {
	floatLit, ok := exp.(*oq_ast.FloatLiteral)
	if !ok {
		t.Errorf("exp not *oq_ast.FloatLiteral. got=%T", exp)
		return false
	}
	if floatLit.Value != value {
		t.Errorf("floatLit.Value not %f. got=%f", value, floatLit.Value)
		return false
	}
	if floatLit.TokenLiteral() != literal {
		t.Errorf("floatLit.TokenLiteral not %s. got=%s", literal, floatLit.TokenLiteral())
		return false
	}
	return true
}

// testIdentifier is a helper to assert on Identifier nodes.
func testIdentifier(t *testing.T, exp oq_ast.Expression, value string) bool {
	ident, ok := exp.(*oq_ast.Identifier)
	if !ok {
		t.Errorf("exp not *oq_ast.Identifier. got=%T", exp)
		return false
	}
	if ident.Value != value {
		t.Errorf("ident.Value not %s. got=%s", value, ident.Value)
		return false
	}
	if ident.TokenLiteral() != value {
		t.Errorf("ident.TokenLiteral not %s. got=%s", value, ident.TokenLiteral())
		return false
	}
	return true
}

func testBooleanLiteral(t *testing.T, exp oq_ast.Expression, value bool) bool {
	bo, ok := exp.(*oq_ast.Boolean)
	if !ok {
		t.Errorf("exp not *oq_ast.Boolean. got=%T", exp)
		return false
	}

	if bo.Value != value {
		t.Errorf("bo.Value not %t. got=%t", value, bo.Value)
		return false
	}

	if bo.TokenLiteral() != fmt.Sprintf("%t", value) {
		t.Errorf("bo.TokenLiteral not %t. got=%s",
			value, bo.TokenLiteral())
		return false
	}

	return true
}

func testLiteralExpression(t *testing.T, exp oq_ast.Expression, expected interface{}) bool {
	switch v := expected.(type) {
	case int:
		return testIntegerLiteral(t, exp, int64(v))
	case int64:
		return testIntegerLiteral(t, exp, v)
	case float64:
		// When calling testLiteralExpression for float, it expects the raw float value.
		// The `exp.TokenLiteral()` will be used as the literal string for comparison inside testFloatLiteral.
		return testFloatLiteral(t, exp, v, exp.TokenLiteral())
	case string:
		return testIdentifier(t, exp, v)
	case bool:
		return testBooleanLiteral(t, exp, v)
	}

	t.Errorf("type of exp not handled. got=%T", exp)

	return false
}

func testInfixExpression(t *testing.T, exp oq_ast.Expression, left interface{}, operator string, right interface{}) bool {
	opExp, ok := exp.(*oq_ast.InfixExpression)

	if !ok {
		t.Errorf("exp is not oq_ast.OperatorExpression. got=%T(%s)", exp, exp)
		return false
	}

	if !testLiteralExpression(t, opExp.Left, left) {
		return false
	}

	if opExp.Operator != operator {
		t.Errorf("exp.Operator is not '%s'. got=%q", operator, opExp.Operator)
		return false
	}

	if !testLiteralExpression(t, opExp.Right, right) {
		return false
	}

	return true
}

func TestLetStatements(t *testing.T) {
	tests := []struct {
		input              string
		expectedIdentifier string
		expectedValue      interface{}
	}{
		{`let x = 5 
		`, "x", 5},
		{`let y = true
		`, "y", true},
		{`let foobar = y
		`, "foobar", "y"},
	}

	for _, tt := range tests {
		l := oq_lexer.New(tt.input)
		p := oq_parser.New(l)

		program := p.ParseProgram()
		checkParserErrors(t, p)

		if len(program.Statements) != 1 {
			t.Fatalf("program.Statements does not contain 1 statements. got=%d", len(program.Statements))
		}

		stmt := program.Statements[0]
		if !testLetStatement(t, stmt, tt.expectedIdentifier) {
			return
		}
		val := stmt.(*oq_ast.LetStatement).Value
		if !testLiteralExpression(t, val, tt.expectedValue) {
			return
		}
	}
}

func TestReturnStatements(t *testing.T) {
	input := `~eng
		return 5
        return 10
        return 993322
    `

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)

	if len(program.Statements) != 3 {
		t.Fatalf("program.Statements does not contain 3 statements. got=%d",
			len(program.Statements))
	}

	for _, stmt := range program.Statements {
		returnStmt, ok := stmt.(*oq_ast.ReturnStatement)
		if !ok {
			t.Errorf("stmt not *ast.returnStatement. got=%T", stmt)
			continue
		}
		if returnStmt.TokenLiteral() != "return" {
			t.Errorf("returnStmt.TokenLiteral not 'return', got %q",
				returnStmt.TokenLiteral())
		}
	}
}

func TestString(t *testing.T) {
	program := &oq_ast.Program{
		Statements: []oq_ast.Statement{
			&oq_ast.LetStatement{
				Token: oq_token.Token{Type: oq_token.LET, Literal: "let"},
				Name: &oq_ast.Identifier{
					Token: oq_token.Token{Type: oq_token.IDENTIFIER, Literal: "myVar"},
					Value: "myVar",
				},
				Value: &oq_ast.Identifier{
					Token: oq_token.Token{Type: oq_token.IDENTIFIER, Literal: "anotherVar"},
					Value: "anotherVar",
				},
			},
		},
	}
	if program.String() != "let myVar = anotherVar" {
		t.Errorf("program.String() wrong. got=%q", program.String())
	}
}

func TestIdentifierExpression(t *testing.T) {
	input := "foobar "

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("program has not enough statements. got=%d",
			len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("program.Statements[0] is not oq_ast.ExpressionStatement. got=%T",
			program.Statements[0])
	}

	ident, ok := stmt.Expression.(*oq_ast.Identifier)
	if !ok {
		t.Fatalf("exp not *ast.Identifier. got=%T", stmt.Expression)
	}
	if ident.Value != "foobar" {
		t.Errorf("ident.Value not %s. got=%s", "foobar", ident.Value)
	}
	if ident.TokenLiteral() != "foobar" {
		t.Errorf("ident.TokenLiteral not %s. got=%s", "foobar",
			ident.TokenLiteral())
	}
}

func TestIntegerLiteralExpression(t *testing.T) {
	input := "5 "

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("program has not enough statements. got=%d",
			len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("program.Statements[0] is not oq_ast.ExpressionStatement. got=%T",
			program.Statements[0])
	}

	literal, ok := stmt.Expression.(*oq_ast.IntegerLiteral)
	if !ok {
		t.Fatalf("exp not *ast.IntegerLiteral. got=%T", stmt.Expression)
	}
	if literal.Value != 5 {
		t.Errorf("literal.Value not %d. got=%d", 5, literal.Value)
	}
	if literal.TokenLiteral() != "5" {
		t.Errorf("literal.TokenLiteral not %s. got=%s", "5",
			literal.TokenLiteral())
	}
}

func TestFloatLiteralExpression(t *testing.T) {
	input := "99.12 "

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("program has not enough statements. got=%d",
			len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("program.Statements[0] is not oq_ast.ExpressionStatement. got=%T",
			program.Statements[0])
	}

	literal, ok := stmt.Expression.(*oq_ast.FloatLiteral)
	if !ok {
		t.Fatalf("exp not *ast.FloatLiteral. got=%T", stmt.Expression)
	}
	if literal.Value != 99.12 {
		t.Errorf("literal.Value not %f. got=%f", 99.12, literal.Value)
	}
	if literal.TokenLiteral() != "99.12" {
		t.Errorf("literal.TokenLiteral not %s. got=%s", "99.12",
			literal.TokenLiteral())
	}
}

func TestParsingPrefixExpressions(t *testing.T) {
	// Define a type for our test cases, including a function to test the right operand.
	type prefixTest struct {
		input         string
		operator      string
		testRightFunc func(t *testing.T, exp oq_ast.Expression) // Function to test the right-hand expression
	}

	prefixTests := []prefixTest{
		// Integer literals with '!' and '-'
		{"!5 ", "!", func(t *testing.T, exp oq_ast.Expression) {
			testIntegerLiteral(t, exp, 5)
		}},
		{"-15 ", "-", func(t *testing.T, exp oq_ast.Expression) {
			testIntegerLiteral(t, exp, 15)
		}},

		// Float literals with '!' and '-'
		{"-12.0 ", "-", func(t *testing.T, exp oq_ast.Expression) {
			testFloatLiteral(t, exp, 12.0, "12.0")
		}},
		{"!12.3 ", "!", func(t *testing.T, exp oq_ast.Expression) {
			testFloatLiteral(t, exp, 12.3, "12.3")
		}},
		// Boolean literals with '!'
		{"!true ", "!", func(t *testing.T, exp oq_ast.Expression) {
			testBooleanLiteral(t, exp, true)
		}},
		{"!false ", "!", func(t *testing.T, exp oq_ast.Expression) {
			testBooleanLiteral(t, exp, false)
		}},
	}

	for _, tt := range prefixTests {
		l := oq_lexer.New(tt.input)
		p := oq_parser.New(l)

		program := p.ParseProgram()
		checkParserErrors(t, p)

		if len(program.Statements) != 1 {
			t.Fatalf("program.Statements does not contain %d statements. got=%d for input %q\n",
				1, len(program.Statements), tt.input)
		}

		stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
		if !ok {
			t.Fatalf("program.Statements[0] is not oq_ast.ExpressionStatement. got=%T for input %q",
				program.Statements[0], tt.input)
		}

		exp, ok := stmt.Expression.(*oq_ast.PrefixExpression)
		if !ok {
			t.Fatalf("stmt.Expression is not oq_ast.PrefixExpression. got=%T for input %q", stmt.Expression, tt.input)
		}
		if exp.Operator != tt.operator {
			t.Fatalf("exp.Operator is not '%s'. got='%s' for input %q",
				tt.operator, exp.Operator, tt.input)
		}

		// Call the specific test function provided in the test case for the right operand
		tt.testRightFunc(t, exp.Right)
	}
}

func TestParsingInfixExpressions(t *testing.T) {
	infixTests := []struct {
		input      string
		leftValue  interface{}
		operator   string
		rightValue interface{}
	}{
		{"5 + 5 ", 5, "+", 5},
		{"5 - 5 ", 5, "-", 5},
		{"5 * 5 ", 5, "*", 5},
		{"5 / 5 ", 5, "/", 5},
		{"5 > 5 ", 5, ">", 5},
		{"5 < 5 ", 5, "<", 5},
		{"5 == 5 ", 5, "==", 5},
		{"5 != 5 ", 5, "!=", 5},
		{"true == true ", true, "==", true},
		{"true != false ", true, "!=", false},
		{"false == false ", false, "==", false},
	}

	for _, tt := range infixTests {
		l := oq_lexer.New(tt.input)
		p := oq_parser.New(l)

		program := p.ParseProgram()
		checkParserErrors(t, p)

		if len(program.Statements) != 1 {
			t.Fatalf("program.Statements does not contain %d statements. got=%d\n",
				1, len(program.Statements))
		}

		stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
		if !ok {
			t.Fatalf("program.Statements[0] is not oq_ast.ExpressionStatement. got=%T",
				program.Statements[0])
		}

		exp, ok := stmt.Expression.(*oq_ast.InfixExpression)
		if !ok {
			t.Fatalf("exp is not oq_ast.InfixExpression. got=%T", stmt.Expression)
		}
		if !testLiteralExpression(t, exp.Left, tt.leftValue) {
			return
		}
		if exp.Operator != tt.operator {
			t.Fatalf("exp.Operator is not '%s'. got=%s",
				tt.operator, exp.Operator)
		}
		if !testLiteralExpression(t, exp.Right, tt.rightValue) {
			return
		}
	}
}

func TestOperatorPrecedenceParsing(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{
			"-a * b ",
			"((-a) * b)",
		},
		{
			"!-a ",
			"(!(-a))",
		},
		{
			"a + b + c ",
			"((a + b) + c)",
		},
		{
			"a + b - c ",
			"((a + b) - c)",
		},
		{
			"a * b * c ",
			"((a * b) * c)",
		},
		{
			"a * b / c ",
			"((a * b) / c)",
		},
		{
			"a + b / c ",
			"(a + (b / c))",
		},
		{
			"a + b * c + d / e - f ",
			"(((a + (b * c)) + (d / e)) - f)",
		},
		{
			`3 + 4 
			 -5 * 5 `,
			"(3 + 4)((-5) * 5)",
		},
		{
			"5 > 4 == 3 < 4 ",
			"((5 > 4) == (3 < 4))",
		},
		{
			"5 < 4 != 3 > 4 ",
			"((5 < 4) != (3 > 4))",
		},
		{
			"3 + 4 * 5 == 3 * 1 + 4 * 5 ",
			"((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
		},
		{
			"3 + 4 * 5 == 3 * 1 + 4 * 5 ",
			"((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
		},
		{
			"true ",
			"true",
		},
		{
			"false ",
			"false",
		},
		{
			"3 > 5 == false ",
			"((3 > 5) == false)",
		},
		{
			"3 < 5 == true ",
			"((3 < 5) == true)",
		},
		{
			"1 + (2 + 3) + 4 ",
			"((1 + (2 + 3)) + 4)",
		},
		{
			"(5 + 5) * 2 ",
			"((5 + 5) * 2)",
		},
		{
			"2 / (5 + 5) ",
			"(2 / (5 + 5))",
		},
		{
			"-(5 + 5) ",
			"(-(5 + 5))",
		},
		{
			"!(true == true) ",
			"(!(true == true))",
		},
		{
			"a + add(b * c) + d ",
			"((a + add((b * c))) + d)",
		},
		{
			"add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
			"add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
		},
		{
			"add(a + b + c * d / f + g)",
			"add((((a + b) + ((c * d) / f)) + g))",
		},
	}
	for _, tt := range tests {
		l := oq_lexer.New(tt.input)
		p := oq_parser.New(l)

		program := p.ParseProgram()
		checkParserErrors(t, p)

		actual := program.String()
		if actual != tt.expected {
			t.Errorf("expected=%q, got=%q", tt.expected, actual)
		}
	}
}

func TestIfExpression(t *testing.T) {
	input := `if (x < y) { x } `

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("program.Body does not contain %d statements. got=%d\n",
			1, len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("program.Statements[0] is not oq_ast.ExpressionStatement. got=%T",
			program.Statements[0])
	}

	exp, ok := stmt.Expression.(*oq_ast.IfExpression)
	if !ok {
		t.Fatalf("stmt.Expression is not oq_ast.IfExpression. got=%T",
			stmt.Expression)
	}
	if !testInfixExpression(t, exp.Condition, "x", "<", "y") {
		return
	}
	if len(exp.Consequence.Statements) != 1 {
		t.Errorf("consequence is not 1 statements. got=%d\n",
			len(exp.Consequence.Statements))
	}

	consequence, ok := exp.Consequence.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("Statements[0] is not oq_ast.ExpressionStatement. got=%T",
			exp.Consequence.Statements[0])
	}
	if !testIdentifier(t, consequence.Expression, "x") {
		return
	}
	if exp.Alternative != nil {
		t.Errorf("exp.Alternative.Statements was not nil. got=%+v", exp.Alternative)
	}
}

func TestFunctionLiteralParsing(t *testing.T) {
	input := `fn(x, y) { x + y }`

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)

	if len(program.Statements) != 1 {
		t.Fatalf("program.Body does not contain %d statements. got=%d\n",
			1, len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("program.Statements[0] is not ast.ExpressionStatement. got=%T",
			program.Statements[0])
	}

	function, ok := stmt.Expression.(*oq_ast.FunctionLiteral)
	if !ok {
		t.Fatalf("stmt.Expression is not ast.FunctionLiteral. got=%T",
			stmt.Expression)
	}
	if len(function.Parameters) != 2 {
		t.Fatalf("function literal parameters wrong. want 2, got=%d\n",
			len(function.Parameters))
	}

	testLiteralExpression(t, function.Parameters[0], "x")
	testLiteralExpression(t, function.Parameters[1], "y")
	if len(function.Body.Statements) != 1 {
		t.Fatalf("function.Body.Statements has not 1 statements. got=%d\n",
			len(function.Body.Statements))
	}

	bodyStmt, ok := function.Body.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("function body stmt is not ast.ExpressionStatement. got=%T",
			function.Body.Statements[0])
	}

	testInfixExpression(t, bodyStmt.Expression, "x", "+", "y")
}

func TestFunctionParameterParsing(t *testing.T) {
	tests := []struct {
		input          string
		expectedParams []string
	}{
		{input: "fn() {}", expectedParams: []string{}},
		{input: "fn(x) {}", expectedParams: []string{"x"}},
		{input: "fn(x, y, z) {}", expectedParams: []string{"x", "y", "z"}},
	}

	for _, tt := range tests {
		l := oq_lexer.New(tt.input)
		p := oq_parser.New(l)

		program := p.ParseProgram()

		checkParserErrors(t, p)

		stmt := program.Statements[0].(*oq_ast.ExpressionStatement)

		function := stmt.Expression.(*oq_ast.FunctionLiteral)

		if len(function.Parameters) != len(tt.expectedParams) {
			t.Errorf("length parameters wrong. want %d, got=%d\n",
				len(tt.expectedParams), len(function.Parameters))
		}

		for i, ident := range tt.expectedParams {
			testLiteralExpression(t, function.Parameters[i], ident)
		}
	}
}

func TestCallExpressionParsing(t *testing.T) {
	input := "add(1, 2 * 3, 4 + 5)"

	l := oq_lexer.New(input)
	p := oq_parser.New(l)

	program := p.ParseProgram()
	checkParserErrors(t, p)
	if len(program.Statements) != 1 {
		t.Fatalf("program.Statements does not contain %d statements. got=%d\n",
			1, len(program.Statements))
	}

	stmt, ok := program.Statements[0].(*oq_ast.ExpressionStatement)
	if !ok {
		t.Fatalf("stmt is not ast.ExpressionStatement. got=%T",
			program.Statements[0])
	}

	exp, ok := stmt.Expression.(*oq_ast.CallExpression)
	if !ok {
		t.Fatalf("stmt.Expression is not ast.CallExpression. got=%T",
			stmt.Expression)
	}

	if !testIdentifier(t, exp.Function, "add") {
		return
	}

	if len(exp.Arguments) != 3 {
		t.Fatalf("wrong length of arguments. got=%d", len(exp.Arguments))
	}

	testLiteralExpression(t, exp.Arguments[0], 1)
	testInfixExpression(t, exp.Arguments[1], 2, "*", 3)
	testInfixExpression(t, exp.Arguments[2], 4, "+", 5)
}

func TestDialectSwitchStatements(t *testing.T) {
	tests := []struct {
		input              string
		expectedStatements []struct {
			stmtType           string      // e.g., "LetStatement", "ExpressionStatement"
			expectedLiteral    string      // The base token literal of the statement (e.g., "let", "if", "fn")
			expectedIdentifier string      // For LetStatement variable name, or FunctionLiteral name
			expectedValue      interface{} // For LetStatement value
		}
	}{
		{
			// Switch to Turkish, then declare a variable using 'olsun'.
			input: `~trk
                    olsun x = 10
                   `,
			expectedStatements: []struct {
				stmtType           string
				expectedLiteral    string
				expectedIdentifier string
				expectedValue      interface{}
			}{
				{
					stmtType:           "LetStatement",
					expectedLiteral:    "let", // EXPECT "let" now, as lexer returns base literal
					expectedIdentifier: "x",
					expectedValue:      10,
				},
			},
		},
		{
			// Switch to Kazakh, then declare a variable using 'болсын'.
			input: `~qzq
                    болсын y = шын
                   `,
			expectedStatements: []struct {
				stmtType           string
				expectedLiteral    string
				expectedIdentifier string
				expectedValue      interface{}
			}{
				{
					stmtType:           "LetStatement",
					expectedLiteral:    "let", // EXPECT "let" now
					expectedIdentifier: "y",
					expectedValue:      true,
				},
			},
		},
		{
			// Switch to Turkish, then declare a variable, then switch back to base/English
			// and declare another variable.
			input: `~trk
                olsun a = 1
                ~eng
                let b = 2
                `,
			expectedStatements: []struct {
				stmtType           string
				expectedLiteral    string
				expectedIdentifier string
				expectedValue      interface{}
			}{
				{
					stmtType:           "LetStatement",
					expectedLiteral:    "let", // EXPECT "let" now
					expectedIdentifier: "a",
					expectedValue:      1,
				},
				{
					stmtType:           "LetStatement",
					expectedLiteral:    "let", // Already "let" in base dialect
					expectedIdentifier: "b",
					expectedValue:      2,
				},
			},
		},
		{
			// Test an 'if' statement in Turkish dialect
			input: `~trk
                    eğer (x < y) { döndür x } yoksa { döndür y }
                   `,
			expectedStatements: []struct {
				stmtType           string
				expectedLiteral    string
				expectedIdentifier string
				expectedValue      interface{}
			}{
				{
					stmtType:           "ExpressionStatement",
					expectedLiteral:    "if", // EXPECT "if" now, as lexer returns base literal
					expectedIdentifier: "",
					expectedValue:      nil,
				},
			},
		},
	}

	for i, tt := range tests {
		t.Run(fmt.Sprintf("Test %d - Input: %q", i, tt.input), func(t *testing.T) {
			l := oq_lexer.New(tt.input)
			p := oq_parser.New(l)

			program := p.ParseProgram()
			checkParserErrors(t, p)

			if len(program.Statements) != len(tt.expectedStatements) {
				t.Fatalf("program.Statements does not contain %d statements after dialect switch. got=%d\nProgram:\n%s",
					len(tt.expectedStatements), len(program.Statements), program.String()) // Added program.String() for debug
			}

			for j, expectedStmt := range tt.expectedStatements {
				stmt := program.Statements[j]

				switch expectedStmt.stmtType {
				case "LetStatement":
					letStmt, ok := stmt.(*oq_ast.LetStatement)
					if !ok {
						t.Errorf("Statement %d not *oq_ast.LetStatement. got=%T", j, stmt)
						continue
					}
					// This comparison now expects the base literal, e.g., "let"
					if letStmt.TokenLiteral() != expectedStmt.expectedLiteral {
						t.Errorf("LetStatement %d TokenLiteral not %q. got=%q", j, expectedStmt.expectedLiteral, letStmt.TokenLiteral())
					}
					// The testLetStatement helper already checks the identifier's name and its literal
					if !testLetStatement(t, stmt, expectedStmt.expectedIdentifier) {
						return
					}
					val := stmt.(*oq_ast.LetStatement).Value
					if !testLiteralExpression(t, val, expectedStmt.expectedValue) {
						return
					}
				case "ExpressionStatement":
					exprStmt, ok := stmt.(*oq_ast.ExpressionStatement)
					if !ok {
						t.Errorf("Statement %d not *oq_ast.ExpressionStatement. got=%T", j, stmt)
						continue
					}
					// The TokenLiteral of the ExpressionStatement should match the base literal of the expression's keyword
					if exprStmt.TokenLiteral() != expectedStmt.expectedLiteral {
						t.Errorf("ExpressionStatement %d TokenLiteral not %q. got=%q", j, expectedStmt.expectedLiteral, exprStmt.TokenLiteral())
					}

					if expectedStmt.expectedLiteral == "if" { // Now checking against base literal "if"
						_, ok := exprStmt.Expression.(*oq_ast.IfExpression)
						if !ok {
							t.Errorf("Expected IfExpression, got %T", exprStmt.Expression)
						}
					} else if expectedStmt.expectedLiteral == "fn" { // Now checking against base literal "fn"
						_, ok := exprStmt.Expression.(*oq_ast.FunctionLiteral)
						if !ok {
							t.Errorf("Expected FunctionLiteral, got %T", exprStmt.Expression)
							continue
						}
					}

				default:
					t.Errorf("Unknown expected statement type: %s", expectedStmt.stmtType)
				}
			}
		})
	}
}
