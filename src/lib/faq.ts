export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is an open source taint analysis engine for agentic application security testing. Agents turn review knowledge into AST-pattern taint rules and dependency models. OpenTaint applies that formal specification across the codebase with deterministic program analysis.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "Built-in rules cover more than 20 vulnerability classes, including SQL injection, XSS, SSRF, SpEL injection, open redirects, path traversal, and command injection. Each finding includes the complete reported flow from the application entry point to the dangerous operation.",
  },
  {
    question: "What are AST-pattern rules?",
    answer: "AST-pattern rules describe untrusted inputs, dangerous operations, and sanitizers in a format familiar from Semgrep and ast-grep. AST-pattern matchers identify matching syntax. Formal program analysis then traces tainted values through methods, fields, async code, and persistence layers. Rules remain readable and directly refinable by people and agents.",
  },
  {
    question: "Why not just use an LLM agent for security scanning?",
    answer: "Agent reviews are flexible, but repeated reviews can return different findings and consume model tokens rereading known code. OpenTaint preserves what the agent learned as taint rules and dependency models, then searches the whole codebase deterministically without model inference.",
  },
  {
    question: "Does OpenTaint require an AI agent?",
    answer: "No. OpenTaint can scan with its built-in rules and models alone. Agent skills are optional: they review application-specific context and produce or refine rules and dependency models for broader coverage.",
  },
  {
    question: "How does OpenTaint secure agent-generated code?",
    answer: "OpenTaint scans agent-generated and human-written code the same way. In CI, it applies the same rules and models to the current codebase, so known vulnerability patterns remain covered regardless of who wrote the change.",
  },
  {
    question: "Why is application security the new tech debt?",
    answer: "Software changes faster than teams can fully review it. Unreviewed attack surfaces and unresolved vulnerabilities accumulate across releases, while attackers can exploit them at any time. OpenTaint turns review knowledge into coverage that can be applied repeatedly instead of rebuilding that context for every review.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "OpenTaint supports Java and Kotlin, with deep support for Spring Boot, Spring MVC, and Spring Data. It analyzes bytecode to resolve inheritance, generics, and calls into libraries on the build classpath. Python and Go are on the roadmap.",
  },
  {
    question: "Why is OpenTaint the most thorough taint analyzer for Spring apps?",
    answer: "OpenTaint tracks tainted values across methods, fields, async boundaries, and JPA persistence. Its dependency models cover Reactor, Spring WebFlux, Kotlin coroutines, and stored flows that enter through one request and reappear in another.",
  },
  {
    question: "How does OpenTaint compare to Semgrep?",
    answer: "OpenTaint provides open source inter-procedural taint analysis, including cross-endpoint and persistence flows. Its AST-pattern rule format supports existing Semgrep syntax, which makes gradual migration possible.",
  },
  {
    question: "How does OpenTaint compare to CodeQL?",
    answer: "Both tools support inter-procedural taint analysis. OpenTaint is fully open source for public and private code, and uses AST-pattern rules that developers and agents can read and refine without learning QL.",
  },
  {
    question: "Is OpenTaint free to use?",
    answer: "Yes. The core engine is Apache 2.0. The CLI, CI integrations, and rules are MIT. You can use them on public, private, and commercial codebases.",
  },
  {
    question: "Can I use existing Semgrep rules?",
    answer: "Yes, with some restrictions and OpenTaint-specific extensions. OpenTaint propagates metavariables as data values through inter-procedural analysis, so the same rule can produce different findings than it does in Semgrep.",
  },
  {
    question: "Still have questions?",
    answer: "",
    isContact: true,
  },
];
