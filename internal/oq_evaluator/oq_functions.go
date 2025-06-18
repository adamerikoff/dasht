package oq_evaluator

var builtins = map[string]*Builtin{
	"len": &Builtin{
		Fn: func(args ...Object) Object {
			if len(args) != 1 {
				return newError("wrong number of arguments. got=%d, want=1", len(args))
			}

			switch arg := args[0].(type) {
			case *String:
				return &Integer{Value: int64(len(arg.Value))}
			default:
				return newError("argument to `len` not supported, got %s", args[0].Type())
			}
		},
	},
	"ұзындығы": &Builtin{
		Fn: func(args ...Object) Object {
			if len(args) != 1 {
				return newError("аргументтердің қате саны. алды=%d, келеді=1",
					len(args))
			}

			switch arg := args[0].(type) {
			case *String:
				return &Integer{Value: int64(len(arg.Value))}
			default:
				return newError("`ұзындығы` аргументіне қолдау көрсетілмейді, %s алынды", args[0].Type())
			}
		},
	},
	"uzunluk": &Builtin{
		Fn: func(args ...Object) Object {
			if len(args) != 1 {
				return newError("yanlış sayıda argüman. got=%d, want=1", len(args))
			}

			switch arg := args[0].(type) {
			case *String:
				return &Integer{Value: int64(len(arg.Value))}
			default:
				return newError("`uzunluk` argümanı desteklenmiyor, %s alındı", args[0].Type())
			}
		},
	},
}
