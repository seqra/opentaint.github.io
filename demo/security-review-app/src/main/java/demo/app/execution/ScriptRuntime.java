package demo.app.execution;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;

public final class ScriptRuntime {
    public void execute(String script) {
        try (Context context = Context.newBuilder("js")
                .allowHostAccess(HostAccess.ALL)
                .build()) {
            context.eval("js", script);
        }
    }
}
