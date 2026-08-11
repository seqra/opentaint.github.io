# Landing redesign plan

Status: approved direction; implementation in progress.

## Approved implementation brief — August 2026

The landing is a product-led narrative, not a sequence of explanatory essays.
Its order is:

1. **Hero** — the product position and the continuous / lean / agentic promise.
2. **Five-minute quickstart** — install OpenTaint, install the AppSec Agent
   skill, and copy the first deep-review prompt.
3. **End-to-end demo** — one stable Review → Enact → Scan → Report workbench.
4. **Continuous and lean application security testing** — an animated
   comparison of agent review alone, formal taint analysis with a fixed
   specification, and OpenTaint combining both.
5. **Application security is the new tech debt** — sourced visual statistics.
6. **A real-world review** — the CVE artifacts and complete report.
7. **The analysis engine** — the mechanisms behind “Fast scans. Fewer false
   alarms. Fewer missed findings.”
7. Comparative results, agent skills, supported technology, FAQ, and footer.

The hero hierarchy is:

> [OpenTaint mark]
>
> THE OPEN SOURCE TAINT ANALYSIS ENGINE FOR THE AI ERA
>
> **CONTINUOUS / LEAN / AGENTIC**
> **APPLICATION SECURITY TESTING**

Only the first word of the headline changes and that word is red; “Application
Security Testing” stays pinned while the prefix rotates, and the complete
headline stays on one line at wide desktop sizes. The prefix slot is balanced
around the three word lengths rather than sized to the longest word, so the
three states retain a stable visual center. The engine line uses the red banner
treatment. Installation is the next section, not part of the hero.

The five-minute quickstart extends the `origin/main` install selector into three
steps: install OpenTaint, install the skills package, and prompt the coding
agent to run a deep security scan and static triage with `appsec-agent`.

The post-demo comparison is a convergence, not a scoreboard:

```text
agent review alone                    fixed-specification taint analysis
flexible, contextual                  fast, consistent, whole-codebase
variable, model-priced                bounded by rules and dependency knowledge
                      \              /
                       taint rules + models
                               ↓
                           OpenTaint
                               ↓
             continuous, lean application security testing
```

Animate observable behavior. Repeating the same agent review spends tokens and
can change its findings. Markdown preserves prose but must be loaded and
interpreted again. A fixed formal scan repeats precisely but cannot invent a
missing security rule, and a trace stops at an opaque external method until its
behavior is modeled. The OpenTaint Agent enacts review conclusions as taint
rules and dependency models; later scans apply the accumulated specification
without model inference.

Across revisions, show the cumulative result explicitly:

```text
review 1 enacts A
review 2 enacts B
review 3 enacts C

subsequent scans apply A ∪ B ∪ C
```

Phrase this as the union of **enacted coverage**, not the union of every
possible agent run. Do not call scans free: use “zero model tokens per scan,”
“minutes of CPU,” or “without model inference.”

The engine section is a separate technical argument. It maps the three product
claims to documented mechanisms:

| Claim | Mechanism | Visual statement |
|---|---|---|
| Fast scans | Abductive inference and compact representations of taint languages | Compress the search; do not truncate it |
| Fewer false alarms | Focused metavariables, explicit dependency models, structured access paths, and expressive non-distributive rules | Model the relevant semantics precisely |
| Fewer missed findings | Extended IFDS analysis to fixpoint without artificial call-depth, file-depth, or access-path limits | Continue until propagation stabilizes |

Semgrep-style AST patterns are compiled into semantic sources, sinks,
sanitizers, and propagation behavior. Show this as the connective tissue from
agent-authored artifacts to whole-program analysis.

**Do not mention symbolic execution anywhere on the landing or in its visual
language.** Do not add numerical performance or precision claims without a
reproducible benchmark.

## Objective

Make the landing highly visual and product-led, with one clear promise:

> Turn one security review into unlimited security scans

Supporting line:

> The flexibility of agent reasoning and the consistency of formal analysis combined

The page must show how an OpenTaint review differs from repeatedly asking an agent to review each revision:

- Agent reasoning is used for new, application-specific security context.
- The useful conclusions are enacted as formal, modular artifacts.
- Taint rules describe what security-relevant behavior to recognize.
- Dependency models describe how data moves through code the engine cannot inspect directly.
- The analyzer interprets the complete specification according to its formal semantics and checks the same inputs consistently whenever a scan runs.
- Later reviews add coverage. They do not require the agent to rediscover every previously learned security fact.

“Reusable knowledge” is not sufficiently precise. Markdown reports, chat history, and review notes are also reusable, but another model must interpret them again. Do not invent an umbrella noun such as “executable security memory.” Use the established formal-methods concept: the taint rules and dependency models form a **formal specification** of the application’s security-relevant behavior.

Use language from formal methods and program analysis precisely:

- **Formal specification** — an explicit representation with defined syntax and semantics. Here, taint rules specify which security-relevant flows to search for, while dependency models summarize how data moves through external methods the analyzer cannot inspect directly.
- **Modular** — rules and models remain distinct units that can be inspected and revised independently. This describes their structure without making the stronger claim implied by “compositional verification.”
- **Extend** — a later review adds a rule or model to the existing specification.
- **Revise** — a later review changes an existing rule or model. Avoid “refine” unless the change preserves a defined higher-level specification.
- **Formal semantics** — the rule and model languages give the analyzer an unambiguous interpretation. This is the source of precision; version control is only lifecycle hygiene.
- **Specification-driven static analysis** — the analyzer checks the program according to an explicit formal specification. Unlike agentic review, no model interprets code or natural-language context during the scan. Use **formal scan** as the shorter landing label.
- Do not use **automated analysis** as the contrast: agentic review is also automated. Do not imply formal verification or proof of absence.
- **Enact** — the product metaphor: the agent makes a review conclusion operative by expressing it as a taint rule or dependency model, much as a principle is enacted as a law.

Avoid “composable” in the primary explanation. In formal methods, composition and compositional verification carry stronger technical meanings about combining specifications or deriving whole-system properties from component properties. The landing only needs the defensible claims that the specification is modular and can be extended or revised.

Recommended explanation:

> A deep review establishes what is untrusted, what is dangerous, and how data moves through the application. The OpenTaint Agent enacts those conclusions as taint rules and dependency models. Together, they form a formal specification that later reviews can extend or revise. OpenTaint uses the complete specification to analyze the whole codebase without model reasoning during the scan.

Short visual sequence:

> Review deeply. Enact the conclusions. Scan repeatedly.

Avoid “tooling,” “memory layer,” and “deterministic dataflow analysis” in the first explanation. They either say too little or require the visitor to understand the implementation before the value.

### Comparison vocabulary

Do not contrast “probabilistic output” with “repeatable analysis” or say “runs without model inference.” Those phrases are either abstract or implementation-led. Show observable behavior instead:

| Agentic security review | Formal scan |
|---|---|
| Same review, findings can change | Same code and specification, same findings |
| Model tokens are spent rereading code | Whole-codebase scan in minutes of CPU |
| Natural-language context is interpreted again | Code is checked under the complete formal specification |

Use **chance-based review** as an expressive section title or transition, not as the explanation of variance. “Same review, different findings” makes the consequence concrete.

Use **consistent analysis** as a short benefit label. Use **reproducible findings** when formal precision matters, and support either with the concrete claim: **same code and specification, same findings**.

Use **minutes of CPU** and **zero model tokens per scan** for the execution/cost contrast. Avoid “local analysis,” which can mean intra-procedural analysis in program-analysis terminology and does not express the economic advantage. “Runs locally or in CI” can appear later as a deployment capability.

## Core comparison: one review versus continuous operation

The main explanatory visual must compare the two approaches over several revisions, not only during one review. Agentic review is compelling in a single moment; its weaknesses become visible when the same process must operate continuously.

### Agent-only security review

```text
revision 1             revision 2                    revision 3
──────────             ──────────                    ──────────
read code              reload saved context          reload saved context
reason                  reread related code           reread related code
write report      →     reason again             →    reason again
                        write another report          write another report

temporary understanding    temporary understanding    temporary understanding
```

- A report or conversation can be saved, but the model must interpret it again.
- Previously learned trust boundaries and code behavior do not directly test the next revision.
- Reviewing only a diff is manageable, but conclusions about the wider codebase still require surrounding code and old context to be loaded again.
- Reviewing the whole codebase repeatedly wastes tokens and time and still does not guarantee that the same findings recur.
- Security knowledge accumulates as prose and prompt context rather than precise coverage.

### OpenTaint

```text
revision 1             revision 2                    revision 3
──────────             ──────────                    ──────────
review new context     review the diff               review the diff
enact conclusions      add new rule/model            revise a model
        │                      │                             │
        ▼                      ▼                             ▼
[ formal specification: extend / revise ]
        │                      │                             │
        ▼                      ▼                             ▼
scan whole codebase     scan whole codebase            scan whole codebase
on CPU                  on CPU                         on CPU
```

- The agent spends reasoning on application-specific attack patterns and code behavior that have not yet been expressed in the formal specification.
- A diff review can extend the specification with new rules and models or revise existing ones.
- Rules and models accumulate in the specification: later scans check the code under the complete specification, not only the additions from the latest diff.
- The scanner can check the whole codebase in minutes on CPU without an agent participating in that scan.
- The result is a lean continuous process: incremental agent reasoning, cumulative formal coverage, and whole-codebase analysis.

Do not imply that every sentence in a security review is automatically convertible. The defensible promise is that each review **can add** repeatable scanning coverage for the security behavior it establishes.

## Experience principles

1. Show the product before explaining the architecture.
2. Use one believable, interactive workbench instead of separate Agent, Viewer, and CLI recordings.
3. Give every section one visual job and no more than one short supporting thought.
4. Introduce the meaning of taint rules and dependency models before showing their YAML.
5. Use motion to show causality: review → enact → scan → finding.
6. Never rely on hover alone. Every interaction must have an obvious control and a touch equivalent.
7. Prefer code-native UI to video so the main demonstration appears immediately and remains sharp at every size.
8. Respect reduced motion, keyboard navigation, contrast, and the existing Carbon-aligned spacing scale.

## Proposed page narrative

### 1. Hero

Copy:

> [OpenTaint mark]
>
> THE OPEN SOURCE TAINT ANALYSIS ENGINE FOR THE AI ERA
>
> **CONTINUOUS / LEAN / AGENTIC**
> **APPLICATION SECURITY TESTING**

Keep the hero focused on the product position. Installation belongs to the
five-minute funnel immediately below it.

### 2. Five-minute quickstart

Copy:

> FIVE-MINUTE QUICKSTART
>
> **Run your first agentic application security test in 5 minutes**

The panel contains three copyable steps: an interactive OpenTaint install
method, `npx skills add https://github.com/seqra/opentaint`, and the prompt
`Run deep security scan and static triage with appsec-agent skill`. Command and
prompt text remains directly clickable in addition to the explicit copy button;
the narrow left rail contains only step numbers, while every stage name sits in
the command side of the panel. The quickstart headline remains on one line at
standard desktop widths.

### 3. Continuous and lean application security testing

Placement: immediately after the unified product demonstration.

Section copy:

> THE FLEXIBILITY OF AGENT REASONING AND THE CONSISTENCY OF FORMAL ANALYSIS COMBINED
>
> **Turn one security review into unlimited security scans**

This is the page’s central explanatory visual. It must show the strengths and weaknesses of agentic review and formal taint analysis on their own, then visibly converge their strengths into the OpenTaint process. It must work both for a single review and across many revisions.

The section eyebrow is **THE FLEXIBILITY OF AGENT REASONING AND THE CONSISTENCY
OF FORMAL ANALYSIS COMBINED**.
Avoid “What works once must keep working.”

Use a prominent time control:

```text
[ One review ]  [ Continuous use ]
```

The **One review** state begins with two opposing panels and converges into OpenTaint. The **Continuous use** state expands them into three synchronized timelines:

```text
Agentic review        Formal taint analysis
       \                 /
        \               /
             OpenTaint
```

#### One review

The first state must be honest about why both approaches are valuable:

| | Strength shown visually | Limitation shown visually |
|---|---|---|
| **Agentic review** | The agent reasons about application intent, trust boundaries, and framework behavior to discover an application-specific attack pattern. | The review does not systematically check every relevant path across the codebase; model-token and elapsed-time counters rise; replaying the same review can change finding symbols. |
| **Formal taint analysis** | A scan pulse covers the complete application codebase in minutes of CPU and produces the same findings for the same code and specification. | It cannot invent an application-specific taint rule, and analyzing every dependency implementation is often unavailable or prohibitively expensive. At an unmodeled external method, the trace stops. |
| **OpenTaint** | The agent enacts the discovered attack pattern as a taint rule and summarizes relevant external-method behavior as a dependency model. The formal scan immediately searches the whole application codebase under the extended specification. | Keep the one-time model cost visible. OpenTaint combines the approaches; it does not make deep investigation free. |

Do not render the strengths and limitations as a static comparison table on the landing. Give each approach a distinct visual behavior:

- **Agentic review** is an adaptive spotlight. It can leave the obvious path, inspect intent and trust boundaries, enter opaque framework code, and discover an attack pattern that was not specified beforehand. Its illuminated area is irregular rather than complete. On replay, some finding symbols change; its token counter rises.
- **Formal taint analysis** is a uniform scan wave over the application codebase graph. Every path described by the current specification is checked, and the same markers return on replay. It has two visible boundaries: without a taint rule it does not know which attack pattern to search for; at an unmodeled external method it cannot continue the trace without analyzing that dependency’s implementation.
- **OpenTaint** visibly transfers the agent’s discovery into the formal side. The discovered attack pattern becomes a taint-rule tile. The security-relevant behavior of the external method becomes a dependency-model tile—a compact method summary rather than the dependency’s full implementation. The rule tells the analyzer what to search for; the model lets the trace cross the external call. Once both enter the formal specification, the scan wave restarts across the application codebase.

The convergence—not a generic Venn diagram—is the decisive animation:

```text
AGENTIC REVIEW                         FORMAL TAINT ANALYSIS

discovers application-specific         searches every path described
attack patterns and interprets         by the formal specification
external code behavior

same review can change                 cannot search for what has
findings; spends model tokens          not been specified; cannot feasibly
                                       inspect every dependency implementation

                 \                    /
                  \  agent enacts    /
                   taint rule + model
                           ↓
                 formal specification
                           ↓
              whole-codebase formal scan
```

Do not explain this transfer primarily with prose. Animate two separate gaps and two separate artifacts:

- The **taint rule (`R`)** gives the scan a security property to search for.
- The **dependency model (`M`)** gives the analyzer a summary for interpreting an external method without analyzing its full implementation.

When `R` enters the specification, the relevant entry and dangerous operation light up. When `M` enters, the stopped trace crosses the external call. Only then does the scan pulse traverse the complete path. The viewer should understand that OpenTaint preserves the agent’s ability to discover a new pattern and interpret external behavior, while formal taint analysis searches for that pattern consistently across the application codebase.

Show the dependency boundary directly:

```text
Formal taint analysis alone
input ━━━ application code ━━━ externalMethod(?) ━╳━ dangerous operation

Agent enacts dependency model M
externalMethod(input) ──summary──▶ return value

OpenTaint scan
input ━━━ application code ━━━ [ M ] ━━━ dangerous operation
```

The dependency model is not a copy of the dependency implementation. It is a formal summary of the method containing only the behavior relevant to the analysis. This preserves tractability: the scan can interpret external calls without recursively analyzing every dependency in full.

#### Continuous use

Switching to **Continuous use** expands the same scene into a revision timeline. Use a scrubber or **Next revision** control rather than loading another graphic.

```text
                    REVISION 1         REVISION 2         REVISION 3         …

Agentic review      agent review       reload + reread    reload + reread
                    report             another report     another report

Formal taint        CPU scan           CPU scan           CPU scan
analysis            fixed spec         fixed spec         fixed spec

OpenTaint           deep review        focused review     focused review
                       ↓                  ↓ when needed       ↓ when needed
                    [ formal specification: extend / revise ]
                       ↓                  ↓                    ↓
                    CPU scan all code  CPU scan all code    CPU scan all code
```

Animate the long-term consequences instead of listing them:

- **Agentic review:** the agent spotlight sweeps previously reviewed files again; saved reports stack up; the token counter rises on every review; finding symbols disappear and reappear; coverage does not visibly accumulate.
- **Formal taint analysis:** each scan remains fast and consistent, but the formal-specification band stays the same width. Attack patterns without taint rules and external-method flows without dependency models remain outside its coverage.
- **OpenTaint:** selected reviews add or revise visible rule/model tiles; the specification band grows; every scan uses the complete specification; previously enacted checks remain stable while new coverage joins them.

Show lean operation through cadence, not another claim:

- CPU scan pulses occur on every demonstrated scan.
- Agent-review events appear when application-specific security behavior must be investigated or the specification must change.
- A diff can trigger focused review and extend the specification, after which the whole codebase is scanned.
- The coverage line grows in steps while model-token spend grows only at agent-review events.

Under the revision timeline, draw the cumulative consequence as three minimal traces rather than another prose comparison:

```text
coverage / consistency over time

Agentic review        ~~~ variable findings; model cost rises every review
Formal taint analysis ─── consistent findings; specified coverage stays flat
OpenTaint             └──└────└── coverage grows; every scan stays consistent
```

The OpenTaint staircase is the visual “best of both worlds”: agent reviews increase what the specification describes; formal taint scans search the whole codebase under the complete specification. Token-cost markers appear only at review/enactment events, while inexpensive CPU-scan markers continue across the timeline.

The combined operating model should remain visible beneath the traces:

```text
discover an attack pattern
          ↓
enact a taint rule or dependency model
          ↓
extend or revise the formal specification
          ↓
formal taint analysis searches the whole codebase
          ↓
lean, continuous application security testing
```

Use minimal proof labels inside the visual:

```text
Same review, findings can change
Same code + specification, same findings
Whole codebase · minutes of CPU
Specification extended
No model tokens on this scan
```

The sourced inconsistency and cost statistics should attach directly to the agent-only events where findings change and model spend repeats. They should not appear as detached marketing numbers.

At the end of the comparison, expand the OpenTaint lane into the unified Conductor workbench described next. This turns the abstract operating model into the real Agent + CLI + report demonstration without introducing a second visual language.

### 3. Unified product demonstration

Build one interactive OpenTaint workbench informed by Cursor’s large product demonstrations and Claude Code’s end-to-end task demo. Do not present three unrelated media tabs.

Claude Code’s useful pattern is not its visual style. It is the interaction grammar: one concrete request unfolds inside one stable product surface. The session list, agent activity, code changes, command results, and live preview remain spatially connected. The visitor can then interact with the result, making the demonstration feel like a product rather than a recording.

Apply that pattern to OpenTaint:

```text
review activity       rules, models + scan          finding report
─────────────────     ─────────────────────────     ──────────────
what the agent sees   what the review leaves behind what the scanner finds
```

- Keep one Conductor review visible from first prompt to final finding.
- Keep the product shell stable while its contents progress; do not replace the whole frame at each step.
- Show agent operations as compact, expandable events: inspected trust boundary, traced framework behavior, wrote rule, tested model.
- Make every operation produce visible evidence in an adjacent pane.
- Let the visitor manipulate the result: select the rule or model, replay the scan, and open the finding trace.
- Treat the activity sequence as the primary navigation. A compact stepper may expose the stages, but it must not make the demo feel like four disconnected slides.
- Collapse the panes into the same sequence on mobile instead of scaling the desktop workbench down.

Persistent activity sequence:

```text
Review  →  Enact  →  Scan  →  Inspect finding
```

Scenes:

1. **Review** — the agent explores Conductor and identifies a trust boundary, a dangerous operation, and opaque library behavior.
2. **Enact** — the agent makes its conclusions operative as a taint rule and dependency model. The files appear as formal project artifacts, not prose in the chat.
3. **Scan** — the CLI checks the codebase under the complete specification. This is where the vulnerability is found.
4. **Inspect** — a simplified report opens inside the same workbench and exposes the complete trace.

The workbench should autoplay once when visible, pause on pointer/focus, and allow direct selection of every stage and artifact. On mobile, render a deliberately narrow version of every scene, including the simplified CLI; do not fit or download the old desktop recording.

Reference: [Claude Code product page](https://claude.com/product/claude-code/)

### 4. Informal review → formal specification

This section replaces the vague “Reusable security knowledge” framing.

Visual metaphor:

```text
untrusted input ─── application code ─── ? ─── dangerous operation
                                           opaque dependency

taint rule        ◎ specifies the attack pattern
dependency model  ⤴ summarizes the external method

input ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ danger
                   complete trace
```

Minimal labels:

- **Taint rule** — What to search for
- **Dependency model** — How data moves through an external method
- **Formal scan** — Checks the application under the complete specification

The artifact cards should be selectable. Selecting one highlights only the part of the path it contributes. A replay control then sends a value through the completed path.

### 5. Application security is the new tech debt

Replace the current paragraph and four prose-heavy questions with evidence-led visual cards. Keep the questions, but let the number lead.

#### Card A — vulnerable AI-generated code

```text
45%
Would you notice the agent slipping a vulnerability into code you never reviewed?
```

Visual: 100 code cells, 45 marked as failing security tests.

Evidence: Veracode tested more than 100 LLMs across four languages; 45% of generated samples failed security tests and introduced a known security flaw.

Source: [Veracode 2025 GenAI Code Security Report](https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/)

#### Card B — exploitation pressure

```text
31%
How long will you keep betting nobody will bother to exploit your code?
```

Visual: breach-entry paths converging on one exploited vulnerability.

Evidence: vulnerability exploitation was the initial entry point in 31% of breaches in Verizon’s 2026 DBIR and surpassed stolen credentials for the first time in the report’s history.

Source: [Verizon 2026 DBIR announcement](https://www.verizon.com/about/news/breach-industry-wide-dbir-finds)

#### Card C — inconsistent agent review

Recommended headline:

```text
86%
Will tomorrow’s security review catch what today’s review found?
```

Supporting fact:

> 86% of LLM-only finding signatures failed to appear in all five identical reviews. Half appeared only once.

Visual: five identical review columns. Finding symbols disappear and reappear between columns; a deterministic scan row below remains unchanged.

Evidence and calculation:

- Snyk ran 300 vulnerability scans over the same code, prompt, and harness: five repetitions for each of six configurations.
- Across the 250 LLM runs, there were 161 unique findings outside the Snyk Code reference set.
- Only 22 appeared in all five repetitions. Therefore 139/161, or **86.3%**, failed to recur in every identical review.
- 80/161, or **49.7%**, appeared in only one of five reviews.
- 104/161, or **64.6%**, appeared in no more than two of five reviews.
- The most variable configuration, Claude Sonnet 4.6 Medium, produced 60 unique unmatched findings: **61.7%** appeared once and only **8.3%** appeared in all five runs.

Required caveat: these were **LLM-only/unmatched reports**, not a set of confirmed vulnerabilities. Known reference findings that an LLM did detect were substantially steadier: 84.8% recurred in all five runs. The claim is that the agent-only review queue is unstable, not that 86% of confirmed vulnerabilities disappear.

Source: [Snyk VulnBench JS 1.0 paper](https://arxiv.org/abs/2606.15762) and [Snyk’s benchmark write-up](https://snyk.io/blog/snyk-vulnbench-js-1-0-llm-security-review-repeatability/)

Secondary corroboration, not the landing headline:

- A 228-scenario study of eight LLMs found that every tested model changed answers across repeated vulnerability-detection runs. Small code augmentations caused incorrect answers in 26% of PaLM2 cases and 17% of GPT-4 cases. [SecLLMHolmes paper](https://arxiv.org/abs/2312.12575)
- In 400 autonomous penetration-test runs against an identical target, full exploitation ranged from 25/100 to 85/100 depending on the model. This measures offensive-agent behavior rather than code review, so use it only as broader evidence of run variance. [400-run consistency study](https://arxiv.org/abs/2605.30096)

#### Card D — cost of repeating deep agent search

Recommended headline:

```text
1,000 runs · <$20K
How much money will you waste asking a security agent to review the same parts of your application again?
```

Visual: 1,000 small run symbols, one successful run highlighted. Label the highlighted run “<$50 in hindsight” and the full campaign “<$20,000”.

Evidence:

- Anthropic ran the same vulnerability-search scaffold over OpenBSD 1,000 times. The campaign cost under $20,000 and produced several dozen findings.
- The run that found a 27-year-old vulnerability cost under $50, but Anthropic explicitly notes that the successful run cannot be known in advance.
- Anthropic separately spent roughly $10,000 over several hundred Mythos runs on FFmpeg, producing several important vulnerabilities.

Source: [Anthropic Mythos cybersecurity evaluation](https://www.anthropic.com/research/mythos-preview)

Conclusion beneath the visual:

> Enact the discovery as a rule instead of repeating the search

Do not claim that OpenTaint scans are free. The defensible claim is that scans do not repeat model reasoning for security knowledge already expressed as rules and models.

Additional cost context for footnotes or later content, not the main card:

- Anthropic’s general multi-agent Code Review averages $15–25 and about 20 minutes per pull request. [Anthropic Code Review](https://claude.com/blog/code-review)
- AWS reports a typical cost of $1,200 for a comprehensive Security Agent penetration test and remediation. [AWS Security Agent](https://aws.amazon.com/blogs/security/aws-security-agent-on-demand-penetration-testing-now-generally-available/)
- Cobalt advertises an AI-and-human autonomous pentest at $3,500 per test. [Cobalt pricing](https://www.cobalt.io/platform/pricing)

#### Security-debt context

If the section needs one framing statistic, use it as a small header rather than a fifth card: Veracode reports that 82% of organizations carry security debt and 60% carry critical security debt in 2026.

Source: [Veracode 2026 State of Software Security](https://www.veracode.com/blog/2026-state-of-software-security-report-risky-security-debt/)

### 6. CVE-2026-58138 interactive replay

Keep the real artifacts but strengthen causality and interactivity.

Sequence:

1. The agent identifies application-specific security semantics.
2. Selecting **Taint rule** highlights `Context.eval()` with `allowAllAccess(true)` as the conditional dangerous operation.
3. Selecting **Dependency model** bridges the opaque builder behavior so data remains traceable through the chain.
4. **Replay scan** moves the untrusted value through the completed path.
5. The embedded report opens to the resulting 182-step trace.

Keep the actual YAML in compact drawers. It is proof, not the first explanation visitors must parse.

Role wording:

- **Agent reviews** — learns trust boundaries and application-specific behavior.
- **Agent enacts** — writes and tests rules and dependency models.
- **OpenTaint scans** — checks the code under the complete specification and finds the vulnerable path.

### 7. The analysis engine

Keep this technical proof separate from the operating-model comparison. The
comparison explains why agent reasoning and formal scans belong together; this
section explains why the OpenTaint engine is not ordinary shallow pattern
matching.

Copy:

> THE ANALYSIS ENGINE
>
> **Fast scans. Fewer false alarms. Fewer missed findings.**
>
> OpenTaint makes exhaustive analysis scalable by compressing the search
> instead of truncating it, then applies explicit security semantics throughout
> the codebase.

Use a single code-native pipeline:

```text
AST-pattern taint rules + dependency models
                    ↓
          semantic rule compilation
                    ↓
       interprocedural fixpoint analysis
                    ↓
            actionable finding
```

Three synchronized proof panels:

- **Fast scans — Compress the search.** Many related propagation states fold
  into a compact representation while analysis continues. Small technical
  labels may name abductive inference and compact taint languages.
- **Fewer false alarms — Model semantics precisely.** Focus the relevant value,
  preserve structured access paths, and use explicit dependency summaries
  instead of a coarse guess at opaque code.
- **Fewer missed findings — Continue to fixpoint.** A long path crosses calls,
  files, fields, aliases, and object layers without meeting an arbitrary depth
  wall. Use “no artificial depth limits,” not a claim of perfect recall.

The rule compiler is the transition into the visual: familiar AST patterns
become semantic sources, sinks, sanitizers, and propagation behavior used by
the interprocedural engine.

Do not mention symbolic execution. Do not imply formal verification, zero false
positives, zero missed findings, or proof of absence.

### 8. Comparative results

Retain the existing engine comparison, but reduce prose and lead with a visual matrix. Every metric needs a visible definition or source. The comparison must reinforce complementarity rather than “agent versus analysis.”

### 9. Agent workflow

Retain the end-to-end workflow diagram as a separate visual block. Remove the descriptive paragraph. Selecting a skill should highlight its place in the review/enact/scan loop and expose a one-line outcome.

### 10. Utility content

Keep supported technologies, installation, FAQ, and footer compact. Installation methods can move here from the hero.

## Copy hierarchy

1. **Promise:** Turn one security review into unlimited security scans
2. **Combination:** The flexibility of agent reasoning and the consistency of formal analysis combined
3. **Mechanism:** Enact review conclusions as taint rules and dependency models in a formal specification
4. **Execution:** The scanner checks the codebase under the complete specification
5. **Compounding value:** Every review can add repeatable coverage to later scans

Avoid:

- “Reusable security knowledge” without naming the rules, models, and repeatable checks it produces.
- “On every change” as an unconditional claim. Use “whenever a scan runs,” “across subsequent scans,” or describe CI as an integration option.
- Claims that the agent alone found the complete vulnerability path.
- Claims that deterministic analysis means zero false positives or zero missed findings.
- “Source-to-sink” in landing copy; show the path visually instead.

## Performance and delivery constraints

- The unified demonstration must render useful content in the initial HTML.
- Do not load the current agent/viewer MP4 files on landing-page startup.
- Use code-native scenes and CSS transforms/opacity for transitions.
- Hydrate the interactive workbench when visible; keep the first scene meaningful before hydration.
- Avoid layout shifts by reserving one stable stage aspect ratio.
- Lazy-load the full external report; embed a simplified local report in the demonstration.
- Keep mobile payload and interaction complete without downloading desktop-only media.

## Accessibility requirements

- The activity sequence exposes an accessible stepper or tablist with correct selected-state semantics even when the visual treatment resembles a task log.
- Autoplay pauses on interaction and is disabled under `prefers-reduced-motion`.
- Every animated causal change also has a textual status update for assistive technology.
- Charts include the exact number and a methodology/source link; meaning cannot depend on color alone.
- Touch targets remain at least 44×44 px.

## Implementation sequence

1. Lock headline, supporting line, four evidence cards, and source wording.
2. Prototype the unified workbench in a standalone React component with static fixture data.
3. Prototype the workbench as a stable three-zone desktop surface and a sequential mobile surface; validate that every activity changes adjacent evidence.
4. Replace the current carousel and remove landing-page video requests.
5. Replace the economics table with the rule/model/path metaphor.
6. Replace SecurityDebt prose with the four sourced visual cards.
7. Build the CVE artifact replay and embed the simplified report.
8. Reduce supporting prose in comparative results and the agent workflow.
9. Add unit tests for stage navigation, reduced motion, sources, and derived statistics.
10. Add Playwright checks for keyboard use, narrow mobile layouts, theme changes, overflow, and absence of eager video requests.
11. Run lint, unit tests, production build, and visual review at phone, Zenfone 7, tablet, laptop, and wide-desktop widths.

## Locked decisions

- The extended install selector belongs in the five-minute quickstart directly
  after the hero.
- The unified demo comes before the operating-model comparison.
- The operating-model comparison is the learn/search explanation; do not add a
  second section that repeats it.
- The comparison shows three processes: agent review alone, formal taint
  analysis with a fixed specification, and OpenTaint combining both.
- The engine proof is a separate section and contains no symbolic-execution
  messaging.
- The CVE replay retains its distinct real-world-review treatment.
