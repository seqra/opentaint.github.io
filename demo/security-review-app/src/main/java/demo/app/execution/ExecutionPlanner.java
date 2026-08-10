package demo.app.execution;

import demo.app.model.JobDefinition;

public final class ExecutionPlanner {
    private final ScriptTaskMapper taskMapper;
    private final ExpressionEvaluator evaluator;

    public ExecutionPlanner(ScriptTaskMapper taskMapper, ExpressionEvaluator evaluator) {
        this.taskMapper = taskMapper;
        this.evaluator = evaluator;
    }

    public void schedule(JobDefinition definition) {
        ScriptTask task = taskMapper.map(definition);
        evaluator.evaluate(task);
    }
}
