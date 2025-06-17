package oq_repl

import (
	"bufio"
	"fmt"
	"io"

	"github.com/adamerikoff/oq/internal/oq_lexer"
	"github.com/adamerikoff/oq/internal/oq_token"
)

const PROMPT = "🏹"

func Start(in io.Reader, out io.Writer) {
	scanner := bufio.NewScanner(in)
	for {
		fmt.Printf(PROMPT)
		scanned := scanner.Scan()
		if !scanned {
			return
		}
		line := scanner.Text() + " "
		l := oq_lexer.New(line)
		for tok := l.NextToken(); tok.Type != oq_token.EOF; tok = l.NextToken() {
			fmt.Printf("{Type:%s Literal:%q}\n", tok.Type, tok.Literal)
		}
	}
}
