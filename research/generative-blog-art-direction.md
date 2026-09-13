# Generative blog art: research and direction

## Executive conclusion

The current headers are reproducible and genuinely algorithmic, but most still read as diagrams decorated with procedural lines. Their algorithms determine the marks; they do not yet create enough interaction between marks. This is why the set feels clean but not deep.

The strongest historical and contemporary precedents point to a different approach: define a compact visual alphabet, define behaviors between its elements, introduce disorder only where it carries meaning, and render the accumulated consequences at several scales. The next generation should therefore be five related visual systems—not five illustrations of nouns.

This research extracts methods, not signature appearances. The work should not reproduce Molnár's squares, Nees's *Schotter*, Mohr's cubes, Hobbs's Fidenza ribbons, or Reas's Process compositions. Its own subject-specific rules, topology, palette, and output selection must make the result recognizably OpenTaint.

## What the precedents teach

| Precedent | System behind the work | Transferable lesson for OpenTaint |
|---|---|---|
| Vera Molnár | Serial variations of a strict geometric premise, with a small, deliberate disturbance introduced into order.[^1][^2] | Preserve a calm baseline so one exception becomes visually and semantically important. Generate families, not isolated accidents. |
| Georg Nees | A small primitive vocabulary whose displacement and rotation increase across space.[^3] | Use a variance field. Randomness should have direction, position, and a reason; it should not be uniformly sprinkled. |
| Frieder Nake | A repertoire of signs selected through bounded probabilities and state-dependent sequences.[^4][^5] | Build a security-specific alphabet—line, bend, fork, join, gap—and let one state influence the next. |
| Manfred Mohr | A fixed formal system whose subsets, complements, projections, and line weights create many compositions.[^6][^7] | Derive each image from one meaningful graph. Red can identify the selected subset while black exposes the larger possibility space. |
| Sol LeWitt / Casey Reas | Instructions are primary; software interprets them. Reas pairs Forms with Behaviors, then lets collisions and accumulated traces produce the image.[^8][^9] | Write the visual rule in one sentence first. A viewer should be able to infer the rule from the result without the image becoming a flowchart. |
| Tyler Hobbs | Flow fields are polished with collision checks, varied seed placement, margins, layered distortion, and higher-level color organization.[^10][^11] | A field is only a substrate. Add exclusion, hierarchy, clustering, and intentional negative space. Assign color by meaning, ancestry, or position. |
| Tyler Hobbs, QQL | Independent, composable parameters expand variation, while a persistent motif holds the family together.[^12] | Give each generator orthogonal controls—density, turbulence, scale, margin, interruption—while preserving one shared OpenTaint signal motif. |
| Jared Tarbell | A substrate spawns variable-mass nodes; a later connection pass creates an emergent network. Other works accumulate particle deposits rather than drawing perfect strokes.[^13][^14] | Separate simulation and rendering passes. Use mass, culling, accumulated traces, and occlusion to create depth and hierarchy. |
| Matt DesLauriers | Hundreds of thousands of small strokes cohere into large stratified forms; deterministic seeds locate outputs inside a multidimensional space.[^15] | Make the macro shape readable at thumbnail size, then reward a larger view with structured micro-marks. |

The recurring principle is bounded causality. A powerful generative image is neither a manually composed diagram nor undirected noise. It is a legible system whose local actions accumulate into an unexpected whole.

## Technical basis

The proposed mechanisms are not interchangeable visual effects. Each produces a different kind of causality:

| Mechanism | What it contributes | Appropriate use |
|---|---|---|
| Curl-noise field | A divergence-free procedural velocity field with coherent circulation rather than arbitrary wobble.[^17] | Neutral data movement and inherited taint lineage. |
| Poisson-disk sampling | Evenly distributed starting points without a visible grid or accidental clumps.[^18] | Sources, agent seeds, graph sites, and protected negative space. |
| Boids / local steering | Global-looking motion emerging from separation, alignment, and cohesion.[^19] | Agent exploration and review convergence. |
| Gray–Scott reaction–diffusion | Spots and bands that grow, divide, merge, or disappear from a small local rule set.[^20] | Framework behavior or state propagation across layers, when contour-extracted rather than shown as a bitmap texture. |
| Voronoi / Delaunay topology | A spatial partition and its adjacency graph, computable efficiently and usable as a shared search substrate.[^21] | Comparing analyzers over identical program structure. |
| Loop-erased random walks | An unbiased spanning-tree construction whose path history removes loops.[^22] | Search-space structure when a maze-like topology is useful without drawing a conventional maze. |
| Differential growth | A line that splits, repels itself, and remains cohesive as it expands.[^23] | Trust boundaries and workflows whose own structure creates a breach. |
| L-systems | Parallel rewriting that makes development, inheritance, and hierarchy explicit.[^24] | Only when the symbols encode application semantics; generic botanical trees are too literal for this set. |

For SVG delivery, these simulations should run at build time and emit simplified paths. No simulation belongs in the browser. Occupancy grids or spatial hashes keep collision work bounded; separate sub-seeds make output stable when one rendering pass changes.

## Diagnosis of the current set

The existing five images share a paper field, a restrained palette, thin line work, and a red signal. That gives them family resemblance. They also render cheaply, scale cleanly as SVG, and remain reproducible.

Their principal weaknesses are:

1. **Repeated composition.** Three images funnel left-to-right into a circular target. The concepts differ, but their silhouettes do not.
2. **Single-scale structure.** The macro gesture is visible, but the middle layer—clusters, neighborhoods, occlusion, local interactions—is weak.
3. **Decorative randomness.** Many small deviations are independent. Because one mark rarely changes another, the output feels generated but not emergent.
4. **Literal symbols.** The maze, tree, and bullseye explain quickly, but stop revealing new structure after the first glance.
5. **Red is too often emphasis rather than state.** It should always mean something precise: selected trace, semantic transition, exploit state, or completed proof.

## The OpenTaint visual grammar

Every header should use five passes:

1. **Substrate:** warm paper, quiet grid, sparse deterministic fibers.
2. **Field:** a low-frequency force, topology, or partition that establishes the macro composition.
3. **Agents:** marks that follow local rules and respond to collisions, neighbors, or state.
4. **Accumulation:** faint deposits, culling, line-weight inheritance, or occlusion that expose the history of the system.
5. **Signal:** a small amount of `#CA2121` attached only to the security event.

The recurring motif should be a **material state change**, not a repeated icon. Depending on the system, it may appear as changed lineage, an interrupted contour, a feedback scar, a longer traversal, or a ruptured boundary. Repeating one visible gate glyph would pull the collection back toward infographics.

Three scales must survive simultaneously:

- **Macro:** one strong field or mass, readable at a 320-pixel thumbnail.
- **Meso:** clusters, strata, neighborhoods, and transitions, readable in the blog index.
- **Micro:** deposited strokes and local irregularities, visible in the article hero and on high-density displays.

Negative space is a generated constraint, not leftover room. Each algorithm should reserve 12–18% of the frame around its principal event, reject collisions that muddy that space, and permit selected paths to enter or leave the crop.

## Five distinct rule systems

### 1. What is taint analysis?

**Instruction:** Release two populations of marked walkers into a shared field; preserve their inherited marks through neutral dependencies; create a new red state only where both populations meet at the same gate.

Use Poisson-like starting positions, a low-frequency vector field, minimum-distance termination, and two inherited line textures. The dependency model is visible as unchanged lineage. The propagator is visible as an explicit state/color change. The join should create a local bloom rather than a bullseye. This embeds the article's core distinction inside the art.

### 2. Building an AppSec agent

**Instruction:** Let independent agents disturb a strict audit lattice; connect only agents that exchange evidence; gradually restore order through repeated review cycles.

Begin with a regular field, introduce a spatial variance gradient, and run alignment/separation/cohesion locally.[^16] Render the accumulated trajectories behind a variable-mass evidence network. One sparse red feedback edge closes the loop. The result should move from search to synthesis without using a branching tree.

### 3. Spring analyzer

**Instruction:** Recursively partition a layered application surface; let neutral dependency edges respect the partitions; allow one vulnerability-specific transition to cross the partition grammar and persist into another layer.

Use recursive subdivision rather than botanical branching. Inherit line weight and tone from parent cells. Connect adjacent cells through legal black gates; the red trace alone changes state at a semantic gate before crossing the persistence band. This makes “dependency” and “propagator” visually different without adding labels.

### 4. Semgrep vs CodeQL vs OpenTaint

**Instruction:** Run three search policies over the same generated program topology and expose how much of the reachable state space each policy resolves.

Replace the literal maze with three aligned observations of one substrate graph. Keep graph geometry constant. Vary only exploration budget, state memory, and path sensitivity. The first trace ends early, the second resolves more branches, and the third composes the full red path. This is both fairer conceptually and more distinctive visually.

### 5. Conductor RCE

**Instruction:** Project a constrained workflow-state graph into two dimensions; activate one complementary subset whose path crosses a trust boundary and changes the graph's state.

Build an original topology from queue, worker, parser, and execution-state transitions, then select subsets and complements in the spirit of combinatorial systems rather than copying cube geometry. Use thick/thin edges for foreground/background state and reserve red for the exploit chain. The composition should orbit an off-center void, not converge on a target.

## Generator architecture

Each artwork should derive independent sub-seeds from a master seed:

```js
const fieldSeed = deriveSeed(masterSeed, 'field');
const agentSeed = deriveSeed(masterSeed, 'agents');
const surfaceSeed = deriveSeed(masterSeed, 'surface');
const signalSeed = deriveSeed(masterSeed, 'signal');
```

Decoupled seeds keep a texture adjustment from rearranging the topology. Each generator should expose orthogonal continuous parameters such as `density`, `variance`, `collisionRadius`, `lineageBias`, and `margin`; avoid a bag of unrelated binary effects.

Generate 24–64 candidate seeds offline and score them deterministically for:

- occupied-area balance;
- largest empty region;
- path continuity;
- red-area ratio;
- edge clipping;
- cluster-size distribution.

Selection is part of authorship. Deterministic generation does not require publishing the first seed the program produces.

For delivery, retain static SVG rather than a runtime canvas. Put high-frequency texture in grouped low-opacity paths, limit filters, round coordinates, and keep the art decorative with an adjacent meaningful alt description supplied by the page. Use the same wide viewBox at all sizes, but test center-crop and full-width behavior independently.

## Acceptance criteria

- Each image has a different silhouette when reduced to solid black.
- The security meaning of red can be stated in one sentence per image.
- The image remains legible in grayscale and at 320 × 140 pixels.
- At least one local interaction—collision, inheritance, transition, culling, or neighbor link—changes later marks.
- Macro, meso, and micro structure are all present.
- No image depends on a literal maze, tree, target, brain, lock, shield, or code window.
- The five images feel related through palette, margins, accumulated line behavior, and semantic use of red rather than repeated layout or symbols.
- Re-running the generator produces byte-identical SVGs.

## Sources

[^1]: Centre Pompidou, [“Vera Molnár: Speak to the Eye”](https://www.centrepompidou.fr/en/program/calendar/event/PA7jRZ5).
[^2]: Digital Art Museum, [Vera Molnár, “(Des)Ordres”](https://dam.org/museum/artists_ui/artists/molnar-vera/des-ordres/).
[^3]: Digital Art Museum, [Georg Nees](https://dam.org/museum/artists_ui/artists/nees-georg/).
[^4]: ZKM, [Frieder Nake, *Hommage à Paul Klee Nr. 2*](https://zkm.de/en/artworks/hommage-a-paul-klee-nr-2).
[^5]: Digital Art Museum, [Frieder Nake](https://dam.org/museum/artists_ui/artists/nake-frieder/).
[^6]: Manfred Mohr, [*Cubic Limit*, P-154c](https://www.emohr.com/mohr_cube1_154c.html).
[^7]: Manfred Mohr, [*Cubic Limit II*, P-198](https://www.emohr.com/mohr_cube2_198.html).
[^8]: Whitney Museum artport, [*{Software} Structures*](https://artport.whitney.org/commissions/software-structures-2016/map.html).
[^9]: Casey Reas, [*Process*](https://reas.com/process).
[^10]: Tyler Hobbs, [“Flow Fields”](https://www.tylerxhobbs.com/words/flow-fields).
[^11]: Tyler Hobbs, [“Color Arrangement in Generative Art”](https://www.tylerxhobbs.com/words/color-arrangment-in-generative-art).
[^12]: Tyler Hobbs, [“The Design Philosophy of the QQL Algorithm”](https://www.tylerxhobbs.com/words/the-design-philosophy-of-the-qql-algorithm).
[^13]: Jared Tarbell, [*Node.Garden*](https://www.jaredstarbell.com/algorithms/node-garden/).
[^14]: Jared Tarbell, [*Sand Traveler*](https://www.jaredstarbell.com/digitalart/sand-traveler/).
[^15]: Matt DesLauriers, [*Meridian*](https://meridian.mattdesl.com/).
[^16]: Processing Foundation, [Flocking example](https://processing.org/examples/flocking).
[^17]: Bridson, Houriham, and Nordenstam, [“Curl-noise for procedural fluid flow”](https://doi.org/10.1145/1276377.1276435), ACM SIGGRAPH 2007.
[^18]: Robert Bridson, [“Fast Poisson Disk Sampling in Arbitrary Dimensions”](https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf), SIGGRAPH 2007 sketches.
[^19]: Craig Reynolds, [“Flocks, Herds and Schools: A Distributed Behavioral Model”](https://doi.org/10.1145/37401.37406), SIGGRAPH 1987.
[^20]: John E. Pearson, [“Complex Patterns in a Simple System”](https://arxiv.org/abs/patt-sol/9304003), *Science* 261 (1993).
[^21]: Steven Fortune, [“A Sweepline Algorithm for Voronoi Diagrams”](https://doi.org/10.1007/BF01840357), *Algorithmica* 2 (1987).
[^22]: David B. Wilson, [“Generating Random Spanning Trees More Quickly than the Cover Time”](https://doi.org/10.1145/237814.237880), STOC 1996.
[^23]: E. M. Yu, [“Interactive Differential Growth Simulation for Design”](https://em-yu.github.io/media/papers/interactive-diff-growth.pdf).
[^24]: Prusinkiewicz and Lindenmayer, [*The Algorithmic Beauty of Plants*](https://algorithmicbotany.org/papers/abop/abop.pdf), Springer, 1990.
