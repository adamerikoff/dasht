package oq_token

const (
	ILLEGAL = "ILLEGAL"
	EOF     = "EOF"

	// Identifiers + literals
	IDENTIFIER = "IDENTIFIER" // add, foobar, x, y, ...
	INTEGER    = "INTEGER"    // 1343456
	FLOAT      = "FLOAT"
	STRING     = "STRING"

	// Operators
	ASSIGN        = "="   // Assignment operator
	PLUS          = "+"   // Addition operator
	MINUS         = "-"   // Subtraction operator
	STAR          = "*"   // Multiplication operator
	SLASH         = "/"   // Division operator
	EXCLAMATION   = "!"   // Logical NOT operator
	LESS          = "<"   // Less than operator
	GREATER       = ">"   // Greater than operator
	LESS_EQUAL    = "<="  // Less than or equal to operator
	GREATER_EQUAL = ">="  // Greater than or equal to operator
	EQUAL         = "=="  // Equality comparison operator
	NOT_EQUAL     = "!="  // Inequality comparison operator (Added this for completeness with '!' lookahead)
	AND           = "AND" // Logical AND operator (from keywords)
	OR            = "OR"  // Logical OR operator (from keywords)

	// Delimiters
	COMMA    = ","        // Separator for arguments, list items
	LPAREN   = "("        // Left parenthesis
	RPAREN   = ")"        // Right parenthesis
	LBRACE   = "{"        // Left curly brace (for blocks, objects)
	RBRACE   = "}"        // Right curly brace
	NEW_LINE = "NEW_LINE" // Newline character

	// Keywords (Reserved words with special meaning)
	FUNCTION = "FUNCTION" // e.g., `fn`
	LET      = "LET"      // e.g., `let` for variable declaration
	TRUE     = "TRUE"     // Boolean literal `true`
	FALSE    = "FALSE"    // Boolean literal `false`
	IF       = "IF"       // Conditional `if`
	ELSE     = "ELSE"     // Conditional `else`
	ELSIF    = "ELSIF"    // Conditional `elsif`
	RETURN   = "RETURN"   // e.g., `return` from a function
	FOR      = "FOR"      // e.g., `for` loop
	WHILE    = "WHILE"    // e.g., `while` loop

	// Dialect specific tokens
	TILDE = "~" // Operator to indicate dialect switch
)

type TokenType string

type Token struct {
	Type    TokenType
	Literal string
}

type KeywordInfo struct {
	Type        TokenType
	BaseLiteral string // The canonical/base literal for the keyword (e.g., "fn", "let")
}

// NewToken is a constructor function for creating a new Token.
// It converts the input `rune` character into a string for the Literal field.
func NewToken(tokenType TokenType, character rune) Token {
	return Token{Type: tokenType, Literal: string(character)}
}

// --- Keyword Maps (Equivalent to your src/lexer/keywords.ts) ---

// BaseKeywords maps English keywords to their TokenType and baseLiteral.
var EngKeywords = map[string]KeywordInfo{
	"fn":     {Type: FUNCTION, BaseLiteral: "fn"},
	"let":    {Type: LET, BaseLiteral: "let"},
	"true":   {Type: TRUE, BaseLiteral: "true"},
	"false":  {Type: FALSE, BaseLiteral: "false"},
	"if":     {Type: IF, BaseLiteral: "if"},
	"else":   {Type: ELSE, BaseLiteral: "else"},
	"elsif":  {Type: ELSIF, BaseLiteral: "elsif"},
	"return": {Type: RETURN, BaseLiteral: "return"},
	"and":    {Type: AND, BaseLiteral: "and"},
	"or":     {Type: OR, BaseLiteral: "or"},
	"for":    {Type: FOR, BaseLiteral: "for"},
	"while":  {Type: WHILE, BaseLiteral: "while"},
}

// QZQKeywords maps Kazakh (Cyrillic) keywords to their TokenType and baseLiteral.
var QzqKeywords = map[string]KeywordInfo{
	"фн":           {Type: FUNCTION, BaseLiteral: "fn"},
	"болсын":       {Type: LET, BaseLiteral: "let"},
	"шын":          {Type: TRUE, BaseLiteral: "true"},
	"жалған":       {Type: FALSE, BaseLiteral: "false"},
	"егер":         {Type: IF, BaseLiteral: "if"},
	"әйтпесе":      {Type: ELSE, BaseLiteral: "else"},
	"егер_әйтпесе": {Type: ELSIF, BaseLiteral: "elsif"},
	"қайтару":      {Type: RETURN, BaseLiteral: "return"},
	"және":         {Type: AND, BaseLiteral: "and"},
	"немесе":       {Type: OR, BaseLiteral: "or"},
	"үшін":         {Type: FOR, BaseLiteral: "for"},
	"уақытша":      {Type: WHILE, BaseLiteral: "while"},
}

// TRKKeywords maps Turkish keywords to their TokenType and baseLiteral.
var TrkKeywords = map[string]KeywordInfo{
	"fn":       {Type: FUNCTION, BaseLiteral: "fn"},
	"olsun":    {Type: LET, BaseLiteral: "let"},
	"doğru":    {Type: TRUE, BaseLiteral: "true"},
	"yanlış":   {Type: FALSE, BaseLiteral: "false"},
	"eğer":     {Type: IF, BaseLiteral: "if"},
	"yoksa":    {Type: ELSE, BaseLiteral: "else"},
	"yok_eğer": {Type: ELSIF, BaseLiteral: "elsif"},
	"döndür":   {Type: RETURN, BaseLiteral: "return"},
	"ve":       {Type: AND, BaseLiteral: "and"},
	"veya":     {Type: OR, BaseLiteral: "or"},
	"için":     {Type: FOR, BaseLiteral: "for"},
	"iken":     {Type: WHILE, BaseLiteral: "while"},
}

// AllDialectsMap is a convenience map to get keyword maps by dialect name.
var AllDialectsMap = map[string]map[string]KeywordInfo{
	"eng": EngKeywords,
	"qzq": QzqKeywords,
	"trk": TrkKeywords,
}

// LookupIdent checks if a given identifier string is a keyword in the provided dialect map.
// If it is, the corresponding KeywordInfo (containing TokenType and baseLiteral) is returned.
// Otherwise, it returns a KeywordInfo with TokenType IDENT and the original literal.
func LookupIdent(ident string, keywords map[string]KeywordInfo) KeywordInfo {
	if info, ok := keywords[ident]; ok {
		return info
	}
	return KeywordInfo{Type: IDENTIFIER, BaseLiteral: ident} // Return IDENT with its original literal
}
