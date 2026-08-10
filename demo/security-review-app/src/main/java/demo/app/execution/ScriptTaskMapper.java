package demo.app.execution;

import demo.app.model.JobDefinition;

public final class ScriptTaskMapper {
    public ScriptTask map(JobDefinition definition) {
        return new ScriptTask(definition.script());
    }
}
