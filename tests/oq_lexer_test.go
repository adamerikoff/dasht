package tests

import (
	"fmt"
	"testing"

	"github.com/adamerikoff/oq/internal/oq_lexer"
	"github.com/adamerikoff/oq/internal/oq_token"
)

func TestNextToken(t *testing.T) {
	// The input string has leading and trailing newlines, and newlines after each ~dialect line.
	input := `
        ~qzq
        ~trk
        ~eng
        let five = 5.0
        let ten = 10
        let add = fn(x, y) {
        x + y
        }
        let result = add(five, ten)
		!-/5.2*5
		5 < 10 > 5
		if (5 < 10) {
		return true
		} else {
		return false
		}
		10 == 10
		10 != 9
		a
    `

	tests := []struct {
		expectedType    oq_token.TokenType
		expectedLiteral string
	}{
		{oq_token.NEW_LINE, "\n"},
		// ~qzq
		{oq_token.TILDE, "~"},
		{oq_token.IDENTIFIER, "qzq"},
		{oq_token.NEW_LINE, "\n"}, // Newline after "qzq"

		// ~trk
		{oq_token.TILDE, "~"},
		{oq_token.IDENTIFIER, "trk"},
		{oq_token.NEW_LINE, "\n"}, // Newline after "trk"

		// ~eng
		{oq_token.TILDE, "~"},
		{oq_token.IDENTIFIER, "eng"},
		{oq_token.NEW_LINE, "\n"}, // Newline after "eng"

		// let five = 5.0
		{oq_token.LET, "let"},
		{oq_token.IDENTIFIER, "five"}, // Make sure "five" is IDENTIFIER, not TILDE (typo in your test?)
		{oq_token.ASSIGN, "="},
		{oq_token.FLOAT, "5.0"}, // Changed to FLOAT if that's what you intend for 5.0
		{oq_token.NEW_LINE, "\n"},

		// let ten = 10
		{oq_token.LET, "let"},
		{oq_token.IDENTIFIER, "ten"},
		{oq_token.ASSIGN, "="},
		{oq_token.INTEGER, "10"},
		{oq_token.NEW_LINE, "\n"},

		// let add = fn(x, y) {
		{oq_token.LET, "let"},
		{oq_token.IDENTIFIER, "add"},
		{oq_token.ASSIGN, "="},
		{oq_token.FUNCTION, "fn"},
		{oq_token.LPAREN, "("},
		{oq_token.IDENTIFIER, "x"},
		{oq_token.COMMA, ","},
		{oq_token.IDENTIFIER, "y"},
		{oq_token.RPAREN, ")"},
		{oq_token.LBRACE, "{"},
		{oq_token.NEW_LINE, "\n"}, // Newline after '{'

		// x + y
		{oq_token.IDENTIFIER, "x"},
		{oq_token.PLUS, "+"},
		{oq_token.IDENTIFIER, "y"},
		{oq_token.NEW_LINE, "\n"}, // Newline after 'y'

		// }
		{oq_token.RBRACE, "}"},
		{oq_token.NEW_LINE, "\n"}, // Newline after '}'

		// let result = add(five, ten)
		{oq_token.LET, "let"},
		{oq_token.IDENTIFIER, "result"},
		{oq_token.ASSIGN, "="},
		{oq_token.IDENTIFIER, "add"},
		{oq_token.LPAREN, "("},
		{oq_token.IDENTIFIER, "five"},
		{oq_token.COMMA, ","},
		{oq_token.IDENTIFIER, "ten"},
		{oq_token.RPAREN, ")"},
		{oq_token.NEW_LINE, "\n"}, // Newline after ')'

		//!-/5.2*5
		{oq_token.EXCLAMATION, "!"},
		{oq_token.MINUS, "-"},
		{oq_token.SLASH, "/"},
		{oq_token.FLOAT, "5.2"},
		{oq_token.STAR, "*"},
		{oq_token.INTEGER, "5"},
		{oq_token.NEW_LINE, "\n"},

		//5 < 10 > 5
		{oq_token.INTEGER, "5"},
		{oq_token.LESS, "<"},
		{oq_token.INTEGER, "10"},
		{oq_token.GREATER, ">"},
		{oq_token.INTEGER, "5"},
		{oq_token.NEW_LINE, "\n"},

		//if (5 < 10) {
		{oq_token.IF, "if"},
		{oq_token.LPAREN, "("},
		{oq_token.INTEGER, "5"},
		{oq_token.LESS, "<"},
		{oq_token.INTEGER, "10"},
		{oq_token.RPAREN, ")"},
		{oq_token.LBRACE, "{"},
		{oq_token.NEW_LINE, "\n"},
		// return true
		{oq_token.RETURN, "return"},
		{oq_token.TRUE, "true"},
		{oq_token.NEW_LINE, "\n"},
		// } else {
		{oq_token.RBRACE, "}"},
		{oq_token.ELSE, "else"},
		{oq_token.LBRACE, "{"},
		{oq_token.NEW_LINE, "\n"},
		// return false
		{oq_token.RETURN, "return"},
		{oq_token.FALSE, "false"},
		{oq_token.NEW_LINE, "\n"},
		// }
		{oq_token.RBRACE, "}"},
		{oq_token.NEW_LINE, "\n"},

		//10 == 10
		{oq_token.INTEGER, "10"},
		{oq_token.EQUAL, "=="},
		{oq_token.INTEGER, "10"},
		{oq_token.NEW_LINE, "\n"},
		//10 != 9
		{oq_token.INTEGER, "10"},
		{oq_token.NOT_EQUAL, "!="},
		{oq_token.INTEGER, "9"},
		{oq_token.NEW_LINE, "\n"},

		{oq_token.IDENTIFIER, "a"},
		{oq_token.NEW_LINE, "\n"},
		{oq_token.EOF, ""},
	}
	l := oq_lexer.New(input)

	for i, tt := range tests {
		tok := l.NextToken()
		fmt.Printf("{Type:%s Literal:%q}\n", tok.Type, tok.Literal)
		if tok.Type != tt.expectedType {
			t.Fatalf("tests[%d] - tokentype wrong.\nexpected=%q (%q), got=%q (%q)",
				i, tt.expectedType, tt.expectedLiteral, tok.Type, tok.Literal)
		}
		if tok.Literal != tt.expectedLiteral {
			t.Fatalf("tests[%d] - literal wrong.\nexpected=%q, got=%q",
				i, tt.expectedLiteral, tok.Literal)
		}
	}
}
