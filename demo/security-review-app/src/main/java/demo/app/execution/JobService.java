package demo.app.execution;

import demo.app.model.JobDefinition;

public final class JobService {
    private final ExecutionPlanner planner;

    public JobService(ExecutionPlanner planner) {
        this.planner = planner;
    }

    public JobReceipt submit(String script) {
        JobDefinition definition = JobDefinition.from(script);
        planner.schedule(definition);
        return JobReceipt.accepted();
    }
}
