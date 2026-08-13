package demo.app.api;

import demo.app.execution.PreviewRenderer;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public final class PreviewController {
    private final PreviewRenderer renderer;

    public PreviewController(PreviewRenderer renderer) {
        this.renderer = renderer;
    }

    @PostMapping("/api/preview")
    public String preview(@RequestParam("template") String template) {
        return renderer.render(template);
    }
}
