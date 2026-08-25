export type FaqItem = {
  readonly question: string;
  readonly answer: string;
  readonly isContact?: boolean;
};

export const faqItems: readonly FaqItem[] = [
  {
    question: "What is taint analysis?",
    answer: "Taint analysis tracks data from untrusted sources to security-sensitive sinks and shows the path that can cause a vulnerability. Developers use this path to find the cause and make a precise fix for injection, path traversal, SSRF, XSS, and other data-flow vulnerabilities.",
  },
  {
    question: "What is OpenTaint?",
    answer: "OpenTaint is an open source taint analysis engine that turns one security finding into a formal check for the full codebase. AST-pattern rules and dependency models store the security knowledge, and formal program analysis finds every modeled match in each scan.",
  },
  {
    question: "How does OpenTaint work in CI/CD?",
    answer: "OpenTaint runs the same vulnerability checks in pull requests and CI/CD builds, so teams can use the results as a security gate before release. GitHub Actions and GitLab CI can start the checks with the same rules and dependency models, and OpenTaint creates SARIF results for pipeline tools.",
  },
  {
    question: "Can developers run the same security checks locally and in CI?",
    answer: "Yes. Developers can use the CLI to find and fix vulnerabilities before they push code, with the same engine, rules, and dependency models as CI. The same inputs produce the same findings in GitHub Actions and GitLab CI. Developers can also examine source-to-sink traces in SARIF or the report viewer and edit YAML rules locally.",
  },
  {
    question: "What vulnerabilities does OpenTaint detect?",
    answer: "OpenTaint detects more than 20 built-in data-flow vulnerability classes, including SQL injection, XSS, SSRF, SpEL injection, SSTI, path traversal, and command injection. OpenTaint agent skills can discover project-specific vulnerability patterns during a security review and turn them into formal checks. The engine then searches the full codebase for every match and shows the complete data-flow path. Developers use this evidence to confirm the risk and fix its cause.",
  },
  {
    question: "What are AST-pattern rules?",
    answer: "AST-pattern rules let people and agents describe untrusted inputs, dangerous operations, and sanitizers with readable syntax similar to Semgrep and ast-grep. OpenTaint translates each AST-pattern rule into a configuration for the taint analyzer and interprets each metavariable as a taint mark on matching data. Formal program analysis then tracks the tainted data through methods, fields, asynchronous code, and persistence layers. This process lets simple rules drive deep data-flow analysis.",
  },
  {
    question: "Why not use only an LLM agent for security scanning?",
    answer: "LLM agents can find new vulnerability patterns and understand application context, but repeated reviews can produce different results and use more model tokens. OpenTaint stores each learned pattern in taint rules and dependency models, then formal program analysis finds every modeled match with local compute.",
  },
  {
    question: "Does OpenTaint require an AI agent?",
    answer: "No. Built-in rules and dependency models let OpenTaint scan a project without an agent, while optional agent skills learn application-specific patterns and add formal checks. Teams can start with standard coverage and add project knowledge when necessary.",
  },
  {
    question: "How does OpenTaint secure agent-generated code?",
    answer: "OpenTaint applies the same formal checks to agent-generated and human-written code, so the author does not change the analysis. Teams can run these checks in CI before the code enters the main branch or a release.",
  },
  {
    question: "Why does application security become technical debt?",
    answer: "Application security becomes technical debt when software changes faster than teams can review it, because unreviewed attack surfaces and unresolved vulnerabilities increase with each release. OpenTaint stores review knowledge in reusable rules and models, so later scans use this knowledge instead of repeating the same review.",
  },
  {
    question: "Which languages and frameworks does OpenTaint support?",
    answer: "OpenTaint supports Java and Kotlin, with deep analysis for Spring Boot, Spring MVC, and Spring Data. Bytecode analysis resolves inheritance, generics, and library calls, which helps OpenTaint follow data through application code and dependencies. The roadmap includes support for Python and Go.",
  },
  {
    question: "How does OpenTaint analyze Spring applications?",
    answer: "OpenTaint follows tainted values through Spring application code, framework calls, asynchronous boundaries, and JPA persistence, with dependency models for Reactor, Spring WebFlux, and Kotlin coroutines. OpenTaint also connects stored data across requests to find long vulnerability paths that cross framework and storage boundaries.",
  },
  {
    question: "How does OpenTaint compare to Semgrep?",
    answer: "Both tools use readable code patterns, but OpenTaint provides open source inter-procedural taint analysis across endpoints and persistence layers. The OpenTaint AST-pattern format supports existing Semgrep syntax, so teams can move compatible rules in stages.",
  },
  {
    question: "How does OpenTaint compare to CodeQL?",
    answer: "Both tools provide inter-procedural taint analysis, but OpenTaint uses readable AST-pattern rules instead of QL queries. Developers and agents can edit these rules without QL knowledge, and OpenTaint is fully open source for public and private code.",
  },
  {
    question: "Is OpenTaint free to use?",
    answer: "Yes. The core engine uses the Apache 2.0 license, while the CLI, CI integrations, and rules use the MIT license. These licenses permit use on public, private, and commercial codebases, and OpenTaint does not charge a fee for each scan.",
  },
  {
    question: "Can I use existing Semgrep rules with OpenTaint?",
    answer: "Yes, if the rule uses supported syntax. OpenTaint lets teams reuse existing rule knowledge and reduce migration work, but it also has extensions and restrictions. OpenTaint tracks metavariables across function calls, so its scans can report different findings than Semgrep.",
  },
  {
    question: "Still have questions?",
    answer: "",
    isContact: true,
  },
];
