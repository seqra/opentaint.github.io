package demo.app.api;

import demo.app.execution.JobService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public final class JobController {
    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/api/jobs")
    public String submit(@RequestParam("script") String script) {
        jobService.submit(script);
        return "accepted";
    }
}
