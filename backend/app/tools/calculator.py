"""Calculator tool: the LLM never does math blindly."""
import ast
import operator as op
from decimal import Decimal, localcontext

_OPS = {
    ast.Add: op.add,
    ast.Sub: op.sub,
    ast.Mult: op.mul,
    ast.Div: op.truediv,
    ast.USub: op.neg,
}


def calculate(expression: str) -> Decimal:
    """Safely evaluate bounded basic arithmetic with decimal precision."""
    if len(expression) > 1000:
        raise ValueError("Expression is too long")
    tree = ast.parse(expression, mode="eval")
    if sum(1 for _ in ast.walk(tree)) > 200:
        raise ValueError("Expression is too complex")

    def _eval(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return Decimal(str(node.value))
        if isinstance(node, ast.BinOp) and type(node.op) in _OPS:
            return _OPS[type(node.op)](_eval(node.left), _eval(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:
            return _OPS[type(node.op)](_eval(node.operand))
        raise ValueError("Unsupported expression")

    with localcontext() as context:
        context.prec = 28
        return _eval(tree.body)
