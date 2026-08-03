export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is the open source taint analysis engine for the AI era: formal program analysis for security agents. During a review, an agent turns vulnerability patterns into reusable AST-pattern taint rules and captures code behavior as dataflow summaries. The deterministic engine then searches for those forbidden dataflow traces across procedures, fields, aliases, async code, and persistence layers on every scan. It is customizable, self-hosted, and an AI-ready open source alternative to Semgrep Pro and CodeQL.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "It detects over 20 classes of vulnerability, including SQL injection, XSS, SSRF, SpEL injection, open redirects, path traversal, and command injection. For each finding, the report walks the full path — from the HTTP source, through method calls, async boundaries, and JPA persistence, down to the dangerous call — and ties it back to the Spring endpoint where the data entered.",
  },
  {
    question: "What are AST-pattern rules?",
    answer: "AST-pattern rules describe code shapes in a format familiar from Semgrep and ast-grep and readable by humans and AI agents alike. An AST-pattern taint rule identifies sources, sinks, sanitizers, and the forbidden dataflow traces between them. Whole-program dataflow analysis follows tainted values through function boundaries, fields, async code, and persistence layers. AST-pattern matchers stop at the syntactic match. OpenTaint keeps tracing the tainted value. When a rule fires on safe code, you refine it directly.",
  },
  {
    question: "Why not just use an LLM agent for security scanning?",
    answer: "Learning an application's attack surface, trust boundaries, vulnerability patterns, and opaque code behavior is expensive and unpredictable. An LLM agent does that work on demand and records what it learns in AST-pattern taint rules and dataflow summaries. Searching for those patterns is cheap and deterministic. OpenTaint applies them across the entire codebase on every scan in minutes of CPU without asking the model to reread every file or burning tokens on every commit. A deep security review becomes lean, continuous application security coverage.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "Java and Kotlin today. The engine works on bytecode, which gives it precise resolution of inheritance, generics, and library calls — including the standard library and any third-party JARs in the build classpath. Spring Boot is supported deeply, including Spring MVC, Spring Data, and the surrounding libraries. Python and Go are next on the roadmap.",
  },
  {
    question: "Why is OpenTaint the most thorough taint analyzer for Spring apps?",
    answer: "It uses formal inter-procedural dataflow analysis to track tainted values across method boundaries. Dataflow summaries model async constructs such as Reactor, Spring WebFlux, and Kotlin coroutines. Out of the box, OpenTaint also models JPA persistence layers, so it catches stored injections where untrusted input arrives at one endpoint, gets saved to the database, and reappears in a completely different request later. Most engines treat the persistence layer as an opaque boundary. OpenTaint models it as part of the dataflow, linking writes in one request to reads in another.",
  },
  {
    question: "How does OpenTaint compare to Semgrep?",
    answer: "Semgrep's open-source engine tracks tainted values within a single function. Inter-procedural analysis lives in the Pro engine, which is closed source and paid. OpenTaint ships formal inter-procedural dataflow analysis under Apache 2.0, including cross-endpoint flows, persistence layers, and stored injections. It is free for any codebase, including commercial closed-source projects. Rules are written in an AST-pattern format that the engine translates into taint configurations, and existing Semgrep rule syntax is supported so you can migrate gradually.",
  },
  {
    question: "How does OpenTaint compare to CodeQL?",
    answer: "CodeQL also uses inter-procedural dataflow analysis for taint tracking, but it is proprietary — free for open source projects and gated behind a paid GitHub Advanced Security license for closed-source code. Its rules are written in QL, a domain-specific query language with its own semantics to learn. OpenTaint is fully open source with no paywall on private code, and its taint rules use an AST-pattern format that any developer or AI agent can read, write, and refine. Formal inter-procedural dataflow analysis comes out of the box.",
  },
  {
    question: "Is OpenTaint free to use?",
    answer: "Yes. The core engine is Apache 2.0, and the CLI, CI integrations, and rules are MIT. Free to use on any codebase, including commercial closed-source projects.",
  },
  {
    question: "Can I use existing Semgrep rules?",
    answer: "OpenTaint supports Semgrep's rule format, with some restrictions and a few extensions (e.g. a taint-style join mode). The engine interprets metavariables as data values — not just syntactic placeholders — and propagates them through inter-procedural dataflow. Because of that semantic difference, the same rule can produce different findings in OpenTaint than in Semgrep.",
  },
  {
    question: "Still have questions?",
    answer: "",
    isContact: true,
  },
];
