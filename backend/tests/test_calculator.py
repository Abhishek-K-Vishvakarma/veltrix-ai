from app.tools.calculator import calculate


def test_bill_calculation():
    assert calculate("220 * 10") == 2200
