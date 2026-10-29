// A small layered program: entry points on the left, dangerous calls on the
// right, methods in between. Deterministic for a given seed.
import { mulberry32 } from "./kit.js";

const placeNodes = (sizes, box) => {
  const step = box.width / (sizes.length - 1);
  let id = 0;
  return sizes.map((size, layer) =>
    Array.from({ length: size }, (_, i) => ({
      id: id++,
      layer,
      x: box.x + layer * step,
      y: box.y + ((i + 0.5) * box.height) / size,
    })),
  );
};

// Each node links to nodes at a similar height in the next layer; every node
// gets at least one incoming edge.
const linkLayers = (from, to, random) => {
  const pairs = from.flatMap((node, i) => {
    const rank = Math.round((i * (to.length - 1)) / Math.max(1, from.length - 1));
    const extra = rank + (random() < 0.5 ? -1 : 1);
    const targets = random() < 0.65 && extra >= 0 && extra < to.length ? [rank, extra] : [rank];
    return targets.map((t) => [node.id, to[t].id]);
  });
  const reached = new Set(pairs.map(([, target]) => target));
  const orphans = to
    .filter((node) => !reached.has(node.id))
    .map((node) => [[...from].sort((a, b) => Math.abs(a.y - node.y) - Math.abs(b.y - node.y))[0].id, node.id]);
  return [...pairs, ...orphans];
};

export const buildFlowGraph = ({ sizes, box, seed, bugSources }) => {
  const random = mulberry32(seed);
  const layers = placeNodes(sizes, box);
  const edges = layers
    .slice(0, -1)
    .flatMap((layer, k) => linkLayers(layer, layers[k + 1], random))
    .map(([from, to], id) => ({ id, from, to }));
  const walk = (node) => {
    const options = edges.filter((edge) => edge.from === node);
    if (options.length === 0) return [];
    const edge = options[Math.floor(random() * options.length)];
    return [edge.id, ...walk(edge.to)];
  };
  return {
    nodes: layers.flat(),
    layers: layers.map((layer) => layer.map((node) => node.id)),
    edges,
    bugPaths: bugSources.map((source) => walk(layers[0][source].id)),
  };
};
