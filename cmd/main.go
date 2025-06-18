package main

import (
	"fmt"
	"os" // Use os for ReadFile

	"github.com/adamerikoff/oq/internal/oq_evaluator"
	"github.com/adamerikoff/oq/internal/oq_lexer"
	"github.com/adamerikoff/oq/internal/oq_parser"
	"github.com/adamerikoff/oq/internal/oq_repl"
)

const version = "0.1"

func main() {
	fmt.Printf("oQ (go interpreter) v%s\n", version)

	if len(os.Args) > 1 {
		// A file path is provided as a command-line argument
		filePath := os.Args[1]
		err := runFile(filePath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error running file %s: %v\n", filePath, err)
			os.Exit(1)
		}
	} else {
		// No file path, start the REPL
		fmt.Println("Entering REPL mode. Press Ctrl+D to exit.")
		oq_repl.Start(os.Stdin, os.Stdout)
	}
}

// runFile reads the content of a file and evaluates it.
func runFile(filePath string) error {
	// Use os.ReadFile instead of ioutil.ReadFile
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("could not read file: %w", err)
	}

	sourceCode := string(content) + "\n" // Ensure a newline at the end

	l := oq_lexer.New(sourceCode)
	p := oq_parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) != 0 {
		fmt.Fprintln(os.Stderr, "Parser errors:")
		for _, msg := range p.Errors() {
			fmt.Fprintf(os.Stderr, "\t%s\n", msg)
		}
		return fmt.Errorf("parsing failed with %d errors", len(p.Errors()))
	}

	env := oq_evaluator.NewEnvironment() // Initialize a new environment for the file
	evaluated := oq_evaluator.Eval(program, env)

	if evaluated != nil {
		fmt.Println(evaluated.Inspect()) // Print the result of the last expression
	}
	return nil
}
