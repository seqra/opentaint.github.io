package demo.app.execution;

public record JobReceipt(String status) {
    public static JobReceipt accepted() {
        return new JobReceipt("accepted");
    }
}
