# oQ: A Multi-Dialect Programming Language Interpreter

oQ is a programming language interpreter designed for script flexibility and cultural inclusivity. It delivers a dynamic and unified coding experience, allowing you to write code using different available programming language dialects within the same codebase, all without needing external preprocessors or complex build steps.

oQ is an experiment in lexical adaptability within a single language. The goal is to enable developers to write code using keywords from different natural languages (or "dialects") and have the interpreter understand and execute it seamlessly.

---

## Key Features

* **Multi-Dialect Support:** Dasht comes with built-in support for:
    * **Base (English) Dialect:** Standard keywords like `if`, `else`, `fn`, `let`.
    * **Kazakh (QZ) Dialect:** Uses Kazakh keywords like `егер`, `әйтпесе`, `фн`, `болсын`.
    * **Turkish (TRK) Dialect:** Uses Turkish keywords like `eğer`, `yoksa`, `fn`, `olsun`.
* **Dynamic Dialect Switching:** Programs can specify their preferred dialect directly within the source code using a simple directive (e.g., `~qzq` or `~trk`). The interpreter dynamically adjusts its keyword recognition based on these directives.
* **Unified Core Logic:** Despite supporting multiple dialects, the underlying Abstract Syntax Tree (AST) and execution logic remain unified. This means code written in different dialects interoperates without issue.
* **No Preprocessing Required:** Unlike solutions that rely on translation layers or compile-time preprocessing, Dasht's interpreter handles dialect recognition at runtime during the lexical and parsing phases. This simplifies the development workflow and speeds up iteration.

---
