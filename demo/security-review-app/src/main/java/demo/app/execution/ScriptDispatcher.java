package demo.app.execution;

public final class ScriptDispatcher {
    private final ExpressionEvaluator evaluator;

    public ScriptDispatcher(ExpressionEvaluator evaluator) {
        this.evaluator = evaluator;
    }

    public void dispatch(String script) {
        evaluator.evaluate(script);
    }
}
