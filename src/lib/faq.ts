export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is the open source taint analysis engine for the AI era: formal program analysis for security agents. During a review, the agent records vulnerability patterns as reusable AST-pattern taint rules and opaque code behavior as dependency models. On every scan, the deterministic engine applies those rules and applies those models while formal inter-procedural dataflow analysis tracks tainted values across procedures, fields, aliases, async code, and persistence layers. It is customizable, self-hosted, and an AI-ready open source alternative to Semgrep Pro and CodeQL.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "It detects over 20 classes of vulnerability, including SQL injection, XSS, SSRF, SpEL injection, open redirects, path traversal, and command injection. For each finding, the report walks the full path — from the HTTP source, through method calls, async boundaries, and JPA persistence, down to the dangerous call — and ties it back to the Spring endpoint where the data entered.",
  },
  {
    question: "What are AST-pattern rules?",
    answer: "AST-pattern rules describe code shapes in a format familiar from Semgrep and ast-grep and readable by humans and AI agents alike. An AST-pattern taint rule identifies sources, sinks, sanitizers, and the source-to-sink flows the engine must report. Formal inter-procedural dataflow analysis follows tainted values through function boundaries, fields, async code, and persistence layers. AST-pattern matchers stop at the syntactic match. OpenTaint keeps tracing the tainted value. When a rule fires on safe code, you refine it directly.",
  },
  {
    question: "Why not just use an LLM agent for security scanning?",
    answer: "Learning an application's attack surface, trust boundaries, vulnerability patterns, and opaque code behavior is expensive and unpredictable. An LLM agent does that work on demand and records vulnerability patterns as AST-pattern taint rules and opaque code behavior as dependency models. Applying those rules and applying those models is cheap and deterministic. OpenTaint does that across the entire codebase on every scan in minutes of CPU without asking the model to reread every file or burning tokens on every commit. A deep security review becomes lean, continuous application security coverage.",
  },
  {
    question: "Does OpenTaint require an AI agent?",
    answer: "No. The engine runs deterministic taint analysis with built-in or existing rules whether or not an agent is present. During a security review, the agent learns the codebase, records vulnerability patterns as new AST-pattern taint rules, and captures opaque code behavior as dependency models. People can inspect and refine both artifacts. The engine applies the rules and applies the models on every scan.",
  },
  {
    question: "How does OpenTaint secure agent-generated code?",
    answer: "A coding agent can introduce a vulnerability before a developer notices the code path. OpenTaint does not need to distinguish AI-generated code from human-written code. The engine applies the same deterministic taint analysis to every change, tracing untrusted input through helpers, fields, aliases, libraries, and persistence layers before it reaches a dangerous operation.",
  },
  {
    question: "Why is application security the new tech debt?",
    answer: "AI helps teams create code faster than anyone can review it. The security work moves downstream into review queues, remediation backlogs, and incident response. Every unmodeled trust boundary and missed source-to-sink path becomes invisible debt that compounds across releases. Attackers automate discovery too. They will probe the paths your team misses whether or not your backlog is ready. Security debt is tech debt an attacker can force you to repay. OpenTaint captures vulnerability patterns as taint rules and opaque code behavior as dependency models, then runs taint analysis on every commit while the code is still fresh and the fix is still cheap.",
  },
  {
    question: "What languages and frameworks are supported?",
    answer: "Java and Kotlin today. The engine works on bytecode, which gives it precise resolution of inheritance, generics, and library calls — including the standard library and any third-party JARs in the build classpath. Spring Boot is supported deeply, including Spring MVC, Spring Data, and the surrounding libraries. Python and Go are next on the roadmap.",
  },
  {
    question: "Why is OpenTaint the most thorough taint analyzer for Spring apps?",
    answer: "It uses formal inter-procedural dataflow analysis to track tainted values across method boundaries. Dependency models describe how values pass through async constructs such as Reactor, Spring WebFlux, and Kotlin coroutines. Out of the box, OpenTaint also models JPA persistence layers, so it catches stored injections where untrusted input arrives at one endpoint, gets saved to the database, and reappears in a completely different request later. Most engines treat the persistence layer as an opaque boundary. OpenTaint tracks tainted values through it, linking writes in one request to reads in another.",
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
