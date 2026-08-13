package demo.app.execution;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.HostAccess;

public final class PreviewRenderer {
    public String render(String template) {
        try (Context context = Context.newBuilder("js")
                .allowHostAccess(HostAccess.NONE)
                .build()) {
            return context.eval("js", template).asString();
        }
    }
}
