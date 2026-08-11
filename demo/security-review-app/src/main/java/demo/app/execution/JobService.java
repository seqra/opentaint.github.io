package demo.app.execution;

public final class JobService {
    private final ScriptDispatcher dispatcher;

    public JobService(ScriptDispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }

    public void submit(String script) {
        dispatcher.dispatch(script);
    }
}
