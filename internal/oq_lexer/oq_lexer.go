package oq_lexer

import (
	"fmt"
	"unicode"
	"unicode/utf8"

	"github.com/adamerikoff/oq/internal/oq_token"
)

type Lexer struct {
	input           string
	currentPosition int                             // current position in input (points to current char)
	nextPosition    int                             // current reading position in input (after current char)
	character       rune                            // current char under examination
	keywords        map[string]oq_token.KeywordInfo // The currently active keyword map for this lexer instance

}

func New(input string) *Lexer {
	l := &Lexer{
		input:    input,
		keywords: oq_token.BaseKeywords,
	} // Default to base keywords on creation

	l.readCharacter()
	return l
}

// SetDialect allows an external component (like the parser) to change the
// active keyword set for this specific lexer instance.
func (l *Lexer) SetDialect(dialect string) {
	if newKeywords, ok := oq_token.AllDialectsMap[dialect]; ok {
		l.keywords = newKeywords
	} else {
		l.keywords = oq_token.BaseKeywords
		fmt.Printf("Warning: Unknown dialect '%s'. Keeping default(eng) keyword map.\n", dialect)
	}
}

func (l *Lexer) peekCharacter() rune {
	if l.nextPosition >= len(l.input) {
		return 0 // EOF
	}
	r, _ := utf8.DecodeRuneInString(l.input[l.nextPosition:])
	return r
}

func (l *Lexer) readCharacter() {
	// If we've reached the end of the input string, set the character to EOF marker (0).
	if l.nextPosition >= len(l.input) {
		l.character = 0 // Represents EOF
		// currentPosition and nextPosition will implicitly remain at the end,
		// which is correct for subsequent calls to indicate EOF.
		return
	}

	// Decode the next rune (Unicode code point) and its size in bytes from the input string.
	// l.input[l.nextPosition:] creates a slice from the current reading head to the end,
	// allowing DecodeRuneInString to read the complete UTF-8 character.
	r, size := utf8.DecodeRuneInString(l.input[l.nextPosition:])

	// Assign the decoded rune to the lexer's current character.
	l.character = r

	// currentPosition is updated to point to the start of the character
	// we are about to read. This is crucial for obtaining the literal of a token.
	l.currentPosition = l.nextPosition

	// Advance nextPosition by the number of bytes this rune occupied.
	// This ensures we move past the entire character, not just one byte.
	l.nextPosition += size
}

// NextToken determines the type of the next token based on the current character
// and returns it. It also advances the lexer to the next character.
func (l *Lexer) NextToken() oq_token.Token {
	var tok oq_token.Token

	// We can add logic here to skip whitespace if necessary
	l.skipWhitespace()

	switch l.character {
	case '~':
		// Lexer's job: recognize '~' as a distinct token.
		// The parser will then decide what to do with a TILDE token followed by an IDENTIFIER.
		tok = oq_token.NewToken(oq_token.TILDE, l.character)
	case '=':
		// Handle '==' (EQUAL) or '=' (ASSIGN)
		if l.peekCharacter() == '=' {
			ch := l.character                           // Store first '='
			l.readCharacter()                           // Consume second '='
			literal := string(ch) + string(l.character) // "=="
			tok = oq_token.Token{Type: oq_token.EQUAL, Literal: literal}
		} else {
			tok = oq_token.NewToken(oq_token.ASSIGN, l.character)
		}
	case '+':
		tok = oq_token.NewToken(oq_token.PLUS, l.character)
	case '-':
		tok = oq_token.NewToken(oq_token.MINUS, l.character)
	case '*':
		tok = oq_token.NewToken(oq_token.STAR, l.character)
	case '/':
		tok = oq_token.NewToken(oq_token.SLASH, l.character)
	case '!':
		// Handle '!=' (NOT_EQUAL) or '!' (EXCLAMATION)
		if l.peekCharacter() == '=' {
			ch := l.character                           // Store '!'
			l.readCharacter()                           // Consume '='
			literal := string(ch) + string(l.character) // "!="
			tok = oq_token.Token{Type: oq_token.NOT_EQUAL, Literal: literal}
		} else {
			tok = oq_token.NewToken(oq_token.EXCLAMATION, l.character)
		}
	case '<':
		// Handle '<=' or '<'
		if l.peekCharacter() == '=' {
			ch := l.character
			l.readCharacter()
			literal := string(ch) + string(l.character)
			tok = oq_token.Token{Type: oq_token.LESS_EQUAL, Literal: literal}
		} else {
			tok = oq_token.NewToken(oq_token.LESS, l.character)
		}
	case '>':
		// Handle '>=' or '>'
		if l.peekCharacter() == '=' {
			ch := l.character
			l.readCharacter()
			literal := string(ch) + string(l.character)
			tok = oq_token.Token{Type: oq_token.GREATER_EQUAL, Literal: literal}
		} else {
			tok = oq_token.NewToken(oq_token.GREATER, l.character)
		}
	case '(':
		tok = oq_token.NewToken(oq_token.LPAREN, l.character)
	case ')':
		tok = oq_token.NewToken(oq_token.RPAREN, l.character)
	case '{':
		tok = oq_token.NewToken(oq_token.LBRACE, l.character)
	case '}':
		tok = oq_token.NewToken(oq_token.RBRACE, l.character)
	case ',':
		tok = oq_token.NewToken(oq_token.COMMA, l.character)
	case '\n':
		tok = oq_token.NewToken(oq_token.NEW_LINE, l.character)
	case 0: // EOF
		tok.Literal = ""
		tok.Type = oq_token.EOF
	default:
		if isLetter(l.character) {
			// Read the identifier (e.g., "fn", "фн", "base", "qzq")
			actualLiteral := l.readIdentifier()

			// Look up the identifier using the lexer's *own* keyword map
			keywordInfo := oq_token.LookupIdent(actualLiteral, l.keywords)

			tok.Type = keywordInfo.Type // The token's type comes from the lookup (e.g., FUNCTION or IDENTIFIER)
			tok.Literal = actualLiteral // The token's literal is the *actual* text from the source
			// tok.BaseLiteral = keywordInfo.BaseLiteral // Optionally, store the base literal here
			return tok // `readIdentifier` already advanced `l.character`
		} else if isDigit(l.character) {
			tok.Literal = l.readNumber()
			if containsDecimal(tok.Literal) {
				tok.Type = oq_token.FLOAT
			} else {
				tok.Type = oq_token.INTEGER
			}
			return tok // `readNumber` already advanced `l.character`
		} else {
			tok = oq_token.NewToken(oq_token.ILLEGAL, l.character)
		}
	}

	l.readCharacter() // Advance lexer for the next token (for single-character or compound tokens)
	return tok
}

// Helper functions (examples, not included in your original code but common in lexers)
// skipWhitespace advances the lexer past any *horizontal* whitespace characters (spaces, tabs).
// It does *not* skip newlines, as newlines are explicitly tokenized.
func (l *Lexer) skipWhitespace() {
	for l.character == ' ' || l.character == '\t' || l.character == '\r' {
		l.readCharacter()
	}
}

func isLetter(character rune) bool {
	return unicode.IsLetter(character)
}

func isDigit(character rune) bool {
	return unicode.IsDigit((character))
}

func (l *Lexer) readIdentifier() string {
	position := l.currentPosition
	for isLetter(l.character) {
		l.readCharacter()
	}
	return l.input[position:l.currentPosition]
}

func (l *Lexer) readNumber() string {
	position := l.currentPosition
	hasDecimal := false // Track if a decimal point has been encountered

	for {
		if unicode.IsDigit(l.character) {
			// Continue reading digits
		} else if l.character == '.' {
			// If we already have a decimal, or the next char isn't a digit,
			// then this isn't part of the number. Break.
			if hasDecimal || !unicode.IsDigit(l.peekCharacter()) {
				break
			}
			hasDecimal = true // Mark that we've seen a decimal
		} else {
			// Not a digit and not a valid decimal point situation, so stop
			break
		}
		l.readCharacter() // Advance to the next character
	}

	return l.input[position:l.currentPosition]
}

func containsDecimal(s string) bool {
	for _, r := range s {
		if r == '.' {
			return true
		}
	}
	return false
}
