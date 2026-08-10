package demo.app.execution;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;

public final class ScriptRuntime {
    public void execute(String script) {
        try (Context context = createContext()) {
            context.eval("js", script);
        }
    }

    private Context createContext() {
        return Context.newBuilder("js")
                .allowHostAccess(HostAccess.ALL)
                .option("engine.WarnInterpreterOnly", "false")
                .build();
    }
}
