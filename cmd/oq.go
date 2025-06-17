package main

import (
	"fmt"
	"os"

	"github.com/adamerikoff/oq/internal/oq_repl"
)

const version = "0.1"

func main() {
	// Print only the version information
	fmt.Printf("oQ (go interpreter) v%s\n", version)

	oq_repl.Start(os.Stdin, os.Stdout)
}
