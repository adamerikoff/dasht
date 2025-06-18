package oq_repl

import (
	"bufio"
	"fmt"
	"io"

	"github.com/adamerikoff/oq/internal/oq_evaluator"
	"github.com/adamerikoff/oq/internal/oq_lexer"
	"github.com/adamerikoff/oq/internal/oq_parser"
)

const PROMPT = "🏹"

func Start(in io.Reader, out io.Writer) {
	scanner := bufio.NewScanner(in)

	env := oq_evaluator.NewEnvironment()

	for {
		fmt.Printf(PROMPT)
		scanned := scanner.Scan()
		if !scanned {
			return
		}

		line := scanner.Text() + "\n"

		l := oq_lexer.New(line)
		p := oq_parser.New(l)

		program := p.ParseProgram()
		if len(p.Errors()) != 0 {
			printParserErrors(out, p.Errors())
			continue
		}

		evaluated := oq_evaluator.Eval(program, env)
		if evaluated != nil {
			io.WriteString(out, evaluated.Inspect())
			io.WriteString(out, "\n")
		}
	}
}

func printParserErrors(out io.Writer, errors []string) {
	for _, msg := range errors {
		io.WriteString(out, "\t"+msg+"\n")
	}
}
