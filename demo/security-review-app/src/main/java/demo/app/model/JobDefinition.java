package demo.app.model;

public record JobDefinition(String script) {
    public static JobDefinition from(String script) {
        return new JobDefinition(script);
    }
}
