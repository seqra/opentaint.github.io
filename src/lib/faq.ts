export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is an open source taint analysis engine for the AI era. It runs inter-procedural dataflow analysis to track untrusted data across function boundaries, persistence layers, aliases, and async code. For Java and Kotlin, the analysis works on bytecode. Rules are written in a readable AST-pattern format expressive enough to describe both vulnerable and safe patterns, letting the engine analyze deeply and precisely. It catches what AST-pattern matchers miss, turns LLM agent findings into reusable rules, and scales beyond what either can do alone.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "It detects over 20 classes of vulnerability, including SQL injection, XSS, SSRF, SpEL injection, open redirects, path traversal, and command injection. For each finding, the report walks the full path — from the HTTP source, through method calls, async boundaries, and JPA persistence, down to the dangerous call — and ties it back to the Spring endpoint where the data entered.",
  },
  {
    question: "What are AST-pattern rules?",
    answer: "Two layers. AST-pattern rules describe the shape of vulnerable code — the same rule format Semgrep and ast-grep use, readable by humans and AI agents alike. Whole-program taint analysis is what reads them: the engine models data flow across the entire program — through function boundaries, fields, async code, and persistence layers — and follows each rule's metavariables as values moving through that flow. AST-pattern matchers stop at the syntactic match; OpenTaint keeps tracing the data through them. When a rule fires on safe code, you refine it directly — the rule format is the same one you'd write for Semgrep or ast-grep.",
  },
  {
    question: "Why not just use an LLM agent for security scanning?",
    answer: "You can, but LLM agents don't come with formal guarantees. Run the same prompt twice and the results may differ — there's no determinism and no way to argue about coverage. And on large codebases the bill adds up quickly: an agent burns through tokens on every file, the cost scales with codebase size, and it still can't promise it looked everywhere. OpenTaint scans the same codebase in minutes of CPU, deterministically, every run. Since AI agents can read and write its AST-pattern rules, you don't have to choose: the agent discovers, the engine applies.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "Java and Kotlin today. The engine works on bytecode, which gives it precise resolution of inheritance, generics, and library calls — including the standard library and any third-party JARs in the build classpath. Spring Boot is supported deeply, including Spring MVC, Spring Data, and the surrounding libraries. Python and Go are next on the roadmap.",
  },
  {
    question: "Why is OpenTaint the most thorough taint analyzer for Spring apps?",
    answer: "It does inter-procedural data-flow analysis, following tainted data across method boundaries and through async constructs — Reactor, Spring WebFlux, and Kotlin coroutines are all modeled via data-flow approximations. Out of the box, it also models JPA persistence layers, so it catches stored injections where untrusted input arrives at one endpoint, gets saved to the database, and reappears in a completely different request later. Most engines treat the persistence layer as an opaque boundary; OpenTaint models it as part of the flow, linking writes in one request to reads in another.",
  },
  {
    question: "How does OpenTaint compare to Semgrep?",
    answer: "Semgrep's open-source engine does intra-procedural taint analysis — it tracks data within a single function. Inter-procedural analysis lives in the Pro engine, which is closed source and paid. OpenTaint ships full inter-procedural dataflow analysis — cross-endpoint flows, persistence layers, stored injections — under Apache 2.0, and it's free for any codebase, including commercial closed-source projects. Rules are written in an AST-pattern format that the engine translates into full taint configurations, and existing Semgrep rule syntax is supported so you can migrate gradually.",
  },
  {
    question: "How does OpenTaint compare to CodeQL?",
    answer: "CodeQL does inter-procedural taint analysis too, but it's proprietary — free for open source projects, and gated behind a paid GitHub Advanced Security license for closed-source code. Its rules are written in QL, a domain-specific query language with its own semantics to learn. OpenTaint is fully open source with no paywall on private code, and its rules are written in an AST-pattern format that any developer or AI agent can read, write, and refine. Full inter-procedural taint analysis comes out of the box.",
  },
  {
    question: "Is OpenTaint free to use?",
    answer: "Yes. The core engine is Apache 2.0, and the CLI, CI integrations, and rules are MIT. Free to use on any codebase, including commercial closed-source projects.",
  },
  {
    question: "Can I use existing Semgrep rules?",
    answer: "OpenTaint supports Semgrep rule syntax, so existing rules work as a starting point. The engine layers inter-procedural dataflow analysis on top of them, and you can extend those rules with OpenTaint's full taint configuration — sources, sinks, sanitizers, propagators — to leverage the inter-procedural engine.",
  },
  {
    question: "Still have questions?",
    answer: "",
    isContact: true,
  },
];
