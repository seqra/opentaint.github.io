export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is an open source taint analysis engine built for the AI coding era. It performs inter-procedural dataflow analysis on Java and Kotlin bytecode — cross-endpoint flow tracking, persistence layer modelling, alias analysis, and asynchronous code analysis. AST-pattern rules find real vulnerabilities in web applications. Finds what AST-pattern matchers miss, enacts what LLM agents discover as permanent rules, scales where neither can alone.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "SQL injection, XSS, SSRF, SpEL injection, open redirects, path traversal, command injection — 20+ types. Each finding traces the path from an HTTP source through method calls, async boundaries, and JPA persistence to the dangerous call, anchored to its Spring endpoint.",
  },
  {
    question: "What are AST-pattern rules?",
    answer: "Two layers. AST-pattern rules describe the shape of vulnerable code — the same rule format Semgrep and ast-grep use, readable by humans and AI agents alike. Whole-program taint analysis is what reads them: the engine analyzes a build artifact, resolving inheritance, generics, and library calls precisely, and tracks each rule's metavariables as program values across function boundaries, fields, async code, and persistence layers. AST-pattern matchers stop at syntactic match; OpenTaint follows the data through the compiled program. When a rule produces a false positive, refine it directly — the rule format is the same one you'd write for Semgrep or ast-grep.",
  },
  {
    question: "Why not just use an LLM agent for security scanning?",
    answer: "LLM agents offer no formal guarantees. Run the same prompt twice and you may get different results — no determinism, no reproducibility. An LLM agent scanning a large codebase burns through token budgets and still can't guarantee full coverage. OpenTaint scans the same codebase in minutes of CPU compute — deterministically. AI agents can read and write OpenTaint's AST-pattern rules, so you get the best of both: AI flexibility with formal analysis underneath.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "Java and Kotlin, analyzed at the bytecode level to precisely understand inheritance, generics, and library interactions. Deep Spring Boot support including Spring MVC, Spring Data, and related libraries. More languages ahead.",
  },
  {
    question: "Why is OpenTaint the most thorough taint analyzer for Spring apps?",
    answer: "OpenTaint performs inter-procedural data-flow analysis that follows taint data across method boundaries, async code, and coroutines. It models JPA persistence layers out of the box, catching stored injections where untrusted input enters via one endpoint, gets persisted to the database, and resurfaces in a completely different request. Most engines treat the persistence layer as an opaque boundary and lose the flow there. OpenTaint follows it through.",
  },
  {
    question: "How does OpenTaint compare to Semgrep?",
    answer: "Semgrep's open-source engine includes intra-procedural taint analysis — it tracks data within a single function. Its Pro engine adds inter-procedural taint analysis, but is closed source and paid. OpenTaint ships full inter-procedural dataflow analysis — cross-endpoint flows, persistence layers, stored injections — under Apache 2.0, free for any codebase including commercial closed-source projects. Rules use an AST-pattern format that the engine translates into complete taint configurations. Semgrep rule syntax is supported as a migration path.",
  },
  {
    question: "How does OpenTaint compare to CodeQL?",
    answer: "CodeQL performs inter-procedural taint analysis, but it's proprietary — free only for open source, and gated behind a paid GitHub Advanced Security license for use on closed-source codebases. Rules are written in QL, a domain-specific query language with its own semantics. OpenTaint is fully open source with no paywall on private code, and delivers formal inter-procedural dataflow analysis with AST-pattern rules any developer or AI agent can read, write, and refine. Full taint analysis out of the box.",
  },
  {
    question: "Is OpenTaint free to use?",
    answer: "Yes. The core engine is Apache 2.0; the CLI, CI integrations, and rules are MIT. Free for any codebase, including commercial closed-source projects.",
  },
  {
    question: "Can I use existing Semgrep rules?",
    answer: "OpenTaint supports Semgrep rule syntax, so existing rules work as a starting point. The engine adds inter-procedural dataflow analysis on top, and you can migrate to AST-pattern rules at your own pace for full control over taint configurations.",
  },
  {
    question: "Still have questions?",
    answer: "",
    isContact: true,
  },
];
