export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is an open source taint analysis engine built for the AI coding era. It performs inter-procedural dataflow analysis on Java and Kotlin bytecode — cross-endpoint flow tracking, persistence layer modelling, alias analysis, and asynchronous code analysis. Code-native rules find real vulnerabilities in web applications. Finds what pattern matching engines miss, enacts what LLM agents discover as permanent rules, scales where neither can alone.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "OpenTaint detects 20+ vulnerability types including SQL injection, XSS, SSRF, SpEL injection, open redirects, path traversal, command injection, and more. It tracks untrusted data from entry points through your application to dangerous APIs. Currently offers deep Spring Boot ecosystem support — every finding is automatically mapped to its HTTP endpoint, so you know exactly which APIs are affected.",
  },
  {
    question: "What are code-native rules?",
    answer: "Rules that look like code. Readable, writable, and tunable by humans and AI agents alike. The engine translates each rule into a full taint configuration — sources, sinks, sanitizers, and propagators connected by typed taint marks. When a rule produces a false positive, you refine the rule directly. No query language to learn, no black box to work around.",
  },
  {
    question: "Why not just use an LLM agent for security scanning?",
    answer: "LLM agents offer no formal guarantees. Run the same prompt twice and you may get different results — no determinism, no reproducibility. An LLM agent scanning a large codebase burns through token budgets and still can't guarantee full coverage. OpenTaint scans the same codebase in minutes of CPU compute — deterministically. AI agents can read and write OpenTaint's code-native rules, so you get the best of both: AI flexibility with formal analysis underneath.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "Java and Kotlin, analyzed at the bytecode level to precisely understand inheritance, generics, and library interactions. Deep Spring Boot support including Spring MVC, Spring Data, and related libraries. More languages ahead.",
  },
  {
    question: "Why is OpenTaint the most thorough taint analyzer for Spring apps?",
    answer: "OpenTaint performs inter-procedural dataflow analysis that follows taint across method boundaries, async code, and coroutines. It models JPA persistence layers, catching stored injections where untrusted input enters via one endpoint, gets persisted to the database, and resurfaces in a completely different request. Most tools lose track at the persistence boundary. OpenTaint doesn't.",
  },
  {
    question: "How does OpenTaint compare to Semgrep?",
    answer: "Semgrep's open-source engine includes intra-procedural taint analysis — it tracks data within a single function. Its Pro engine adds inter-procedural taint analysis behind a paid tier. OpenTaint ships full inter-procedural dataflow analysis — cross-endpoint flows, persistence layers, stored injections — under Apache 2.0. Rules use a code-native format that the engine translates into complete taint configurations. Semgrep rule syntax is supported as a migration path.",
  },
  {
    question: "How does OpenTaint compare to CodeQL?",
    answer: "CodeQL requires learning QL — a specialized query language that AI agents can't easily write. OpenTaint delivers formal inter-procedural dataflow analysis with code-native rules any developer or AI agent can read, write, and refine. No proprietary licensing, no paywall. Full taint analysis out of the box.",
  },
  {
    question: "Is OpenTaint free to use?",
    answer: "Yes. The core engine is licensed under Apache 2.0. The CLI, CI integrations, and rules are licensed under MIT.",
  },
  {
    question: "Can I use existing Semgrep rules?",
    answer: "OpenTaint supports Semgrep rule syntax, so existing rules work as a starting point. The engine adds inter-procedural dataflow analysis on top, and you can migrate to code-native rules at your own pace for full control over taint configurations.",
  },
  {
    question: "Still have questions?",
    answer: "",
    isContact: true,
  },
];
