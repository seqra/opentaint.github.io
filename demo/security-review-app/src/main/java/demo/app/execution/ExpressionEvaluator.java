package demo.app.execution;

public final class ExpressionEvaluator {
    private final ScriptRuntime runtime;

    public ExpressionEvaluator(ScriptRuntime runtime) {
        this.runtime = runtime;
    }

    public void evaluate(String script) {
        runtime.execute(script);
    }
}
