package oq_evaluator

import (
	"fmt"

	"github.com/adamerikoff/oq/internal/oq_ast"
)

var (
	NULL  = &Null{}
	TRUE  = &Boolean{Value: true}
	FALSE = &Boolean{Value: false}
)

func Eval(node oq_ast.Node, env *Environment) Object {
	switch node := node.(type) {
	// Statements
	case *oq_ast.LetStatement:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}
		env.Set(node.Name.Value, val)
	case *oq_ast.Identifier:
		return evalIdentifier(node, env)
	case *oq_ast.Program:
		return evalProgram(node, env)
	case *oq_ast.ExpressionStatement:
		return Eval(node.Expression, env)
	case *oq_ast.Boolean:
		return nativeBoolToBooleanObject(node.Value)
	case *oq_ast.PrefixExpression:
		right := Eval(node.Right, env)
		if isError(right) {
			return right
		}
		return evalPrefixExpression(node.Operator, right)
	// Expressions
	case *oq_ast.IntegerLiteral:
		return &Integer{Value: node.Value}
	case *oq_ast.FloatLiteral: // Add this case
		return &Float{Value: node.Value}
	case *oq_ast.InfixExpression:
		left := Eval(node.Left, env)
		if isError(left) {
			return left
		}
		right := Eval(node.Right, env)
		if isError(right) {
			return right
		}
		return evalInfixExpression(node.Operator, left, right)
	case *oq_ast.BlockStatement:
		return evalBlockStatement(node, env)
	case *oq_ast.IfExpression:
		return evalIfExpression(node, env)
	case *oq_ast.ReturnStatement:
		val := Eval(node.ReturnValue, env)
		if isError(val) {
			return val
		}
		return &ReturnValue{Value: val}
	case *oq_ast.FunctionLiteral:
		params := node.Parameters
		body := node.Body
		return &Function{Parameters: params, Env: env, Body: body}
	case *oq_ast.CallExpression:
		function := Eval(node.Function, env)
		if isError(function) {
			return function
		}
		args := evalExpressions(node.Arguments, env)
		if len(args) == 1 && isError(args[0]) {
			return args[0]
		}
		return applyFunction(function, args)
	}

	return nil
}

func evalExpressions(exps []oq_ast.Expression, env *Environment) []Object {
	var result []Object

	for _, e := range exps {
		evaluated := Eval(e, env)
		if isError(evaluated) {
			return []Object{evaluated}
		}
		result = append(result, evaluated)
	}

	return result
}

func nativeBoolToBooleanObject(input bool) *Boolean {
	if input {
		return TRUE
	}
	return FALSE
}

func evalPrefixExpression(operator string, right Object) Object {
	switch operator {
	case "!":
		return evalBangOperatorExpression(right)
	case "-":
		return evalMinusPrefixOperatorExpression(right)
	default:
		return newError("unknown operator: %s%s", operator, right.Type())
	}
}

func evalBangOperatorExpression(right Object) Object {
	switch right {
	case TRUE:
		return FALSE
	case FALSE:
		return TRUE
	case NULL:
		return TRUE
	default:
		return FALSE
	}
}

func evalMinusPrefixOperatorExpression(right Object) Object {
	if right.Type() == INTEGER_OBJ {
		value := right.(*Integer).Value

		return &Integer{Value: -value}
	}

	if right.Type() == FLOAT_OBJ {
		value := right.(*Float).Value

		return &Float{Value: -value}
	}

	return newError("unknown operator: -%s", right.Type())
}

func evalInfixExpression(operator string, left, right Object) Object {
	// Case 1: Both are Integers
	if left.Type() == INTEGER_OBJ && right.Type() == INTEGER_OBJ {
		return evalIntegerInfixExpression(operator, left, right)
	}
	// Case 2: Both are Floats
	if left.Type() == FLOAT_OBJ && right.Type() == FLOAT_OBJ {
		return evalFloatInfixExpression(operator, left, right)
	}
	// Case 3: Mixed types (Integer and Float) - promoted to float
	if (left.Type() == INTEGER_OBJ && right.Type() == FLOAT_OBJ) ||
		(left.Type() == FLOAT_OBJ && right.Type() == INTEGER_OBJ) {
		return evalMixedNumericInfixExpression(operator, left, right)
	}
	// Case 4: Both are Booleans (for == and !=)
	if left.Type() == BOOLEAN_OBJ && right.Type() == BOOLEAN_OBJ {
		return evalBooleanInfixExpression(operator, left, right)
	}
	// Default: Handle other types or invalid combinations
	return newError("type mismatch: %s %s %s", left.Type(), operator, right.Type())
}

func evalBooleanInfixExpression(operator string, left, right Object) Object {
	leftVal := left.(*Boolean).Value
	rightVal := right.(*Boolean).Value

	switch operator {
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
	default:
		// Boolean objects only support == and != for now
		return newError("unknown operator: %s %s %s", left.Type(), operator, right.Type())
	}
}

func evalIntegerInfixExpression(operator string, left, right Object) Object {
	leftVal := left.(*Integer).Value
	rightVal := right.(*Integer).Value

	switch operator {
	case "+":
		return &Integer{Value: leftVal + rightVal}
	case "-":
		return &Integer{Value: leftVal - rightVal}
	case "*":
		return &Integer{Value: leftVal * rightVal}
	case "/":
		return &Integer{Value: leftVal / rightVal}
	case "<":
		return nativeBoolToBooleanObject(leftVal < rightVal)
	case ">":
		return nativeBoolToBooleanObject(leftVal > rightVal)
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
	default:
		return NULL
	}
}

func evalFloatInfixExpression(operator string, left, right Object) Object {
	leftVal := left.(*Float).Value
	rightVal := right.(*Float).Value

	switch operator {
	case "+":
		return &Float{Value: leftVal + rightVal}
	case "-":
		return &Float{Value: leftVal - rightVal}
	case "*":
		return &Float{Value: leftVal * rightVal}
	case "/":
		return &Float{Value: leftVal / rightVal}
	case "<":
		return nativeBoolToBooleanObject(leftVal < rightVal)
	case ">":
		return nativeBoolToBooleanObject(leftVal > rightVal)
	case "==":
		return nativeBoolToBooleanObject(leftVal == rightVal)
	case "!=":
		return nativeBoolToBooleanObject(leftVal != rightVal)
	default:
		return NULL
	}
}

// evalMixedNumericInfixExpression promotes integers to floats for mixed operations
func evalMixedNumericInfixExpression(operator string, left, right Object) Object {
	var leftFloatVal float64
	var rightFloatVal float64

	if left.Type() == INTEGER_OBJ {
		leftFloatVal = float64(left.(*Integer).Value)
	} else {
		leftFloatVal = left.(*Float).Value
	}

	if right.Type() == INTEGER_OBJ {
		rightFloatVal = float64(right.(*Integer).Value)
	} else {
		rightFloatVal = right.(*Float).Value
	}

	// Now perform the operation as if both were floats
	return evalFloatInfixExpression(operator, &Float{Value: leftFloatVal}, &Float{Value: rightFloatVal})
}

func evalIfExpression(ie *oq_ast.IfExpression, env *Environment) Object {
	condition := Eval(ie.Condition, env)

	if isError(condition) {
		return condition
	}

	if isTruthy(condition) {
		return Eval(ie.Consequence, env)
	} else if ie.Alternative != nil {
		return Eval(ie.Alternative, env)
	} else {
		return NULL
	}
}

func isTruthy(obj Object) bool {
	switch obj {
	case NULL:
		return false
	case TRUE:
		return true
	case FALSE:
		return false
	default:
		return true
	}
}

func evalProgram(program *oq_ast.Program, env *Environment) Object {
	var result Object

	for _, statement := range program.Statements {
		result = Eval(statement, env)

		switch result := result.(type) {
		case *ReturnValue:
			return result.Value
		case *Error:
			return result
		}
	}

	return result
}

func evalBlockStatement(block *oq_ast.BlockStatement, env *Environment) Object {
	var result Object

	for _, statement := range block.Statements {
		result = Eval(statement, env)

		if result != nil {
			rt := result.Type()
			if rt == RETURN_VALUE_OBJ || rt == ERROR_OBJ {
				return result
			}
		}
	}

	return result
}

func newError(format string, a ...interface{}) *Error {
	return &Error{Message: fmt.Sprintf(format, a...)}
}

func isError(obj Object) bool {
	if obj != nil {
		return obj.Type() == ERROR_OBJ
	}
	return false
}

func evalIdentifier(node *oq_ast.Identifier, env *Environment) Object {
	val, ok := env.Get(node.Value)
	if !ok {
		return newError("identifier not found: " + node.Value)
	}
	return val
}

func applyFunction(fn Object, args []Object) Object {
	function, ok := fn.(*Function)
	if !ok {
		return newError("not a function: %s", fn.Type())
	}
	extendedEnv := extendFunctionEnv(function, args)
	evaluated := Eval(function.Body, extendedEnv)
	return unwrapReturnValue(evaluated)
}

func extendFunctionEnv(fn *Function, args []Object) *Environment {
	env := NewEnclosedEnvironment(fn.Env)
	for paramIdx, param := range fn.Parameters {
		env.Set(param.Value, args[paramIdx])
	}
	return env
}

func unwrapReturnValue(obj Object) Object {
	if returnValue, ok := obj.(*ReturnValue); ok {
		return returnValue.Value
	}
	return obj
}
