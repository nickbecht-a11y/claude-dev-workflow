# Edge Quality Rules

Use these rules for professional draw.io routing. They apply to architecture diagrams, network diagrams, and paper figures.

## Blocking Rules

1. **Non-waypoint edges need full connection points**
   - Set `exitX`, `exitY`, `entryX`, `entryY`, `exitDx=0`, `exitDy=0`, `entryDx=0`, `entryDy=0`.
2. **Waypoint edges must not mix explicit connection points**
   - If `waypoints` are present, remove manual exit/entry hints.
3. **Corners are forbidden**
   - Do not use `0/0`, `0/1`, `1/0`, `1/1` corner pairs. Use face centers or distributed slots.
4. **Distribute edges on shared faces**
   - When multiple edges leave or enter the same face, use `0.25`, `0.5`, `0.75` slots.
5. **Preserve corridor spacing**
   - Parallel corridors should be at least `30px` apart.
6. **Keep the final segment readable**
   - The segment entering the target should be at least `30px`.
7. **Offset labels away from the line**
   - Horizontal edges: `y=-12` or stronger.
   - Vertical edges: `x=12` or stronger.
   - Do not use `labelBackgroundColor` to hide the line.

## Geometry Facts That Bite

Two mxGraph details that silently produce a no-op if you assume otherwise:

1. **An edge label's relative `x` runs -1 to +1, not 0 to 1.** `-1` is the source
   end, `0` the midpoint, `+1` the target end. Setting `x="0.12"` to mean
   "just after the source" actually parks the label a hair past the midpoint,
   which is usually exactly where an unrelated node sits.
2. **A newline inside a `value` may be written `&#xa;` as well as `&#10;`.**
   Any code that measures a label must decode both, or a multi-line label is
   measured as one very long single line and sized wrongly.

## Placing a Label That Has Nowhere To Go

When an edge crosses a lane whose nodes span its full width, no point along that
edge is clear, and searching along the line cannot succeed. Two fixes that do:

- **Put it in a lane gap.** The vertical strip between two lanes is node-free at
  every y, which makes it immune to the fact that draw.io routes orthogonally
  while your model probably assumes a straight line. Widen the gap if the label
  does not fit; a label wider than the gap will creep back onto a node.
- **Give the lane a gutter and route skip edges down it.** An edge between two
  non-adjacent nodes in the same lane is otherwise drawn straight through
  whatever sits between them. A node-free channel down one side of the lane
  fixes both the crossing and the label, since the edge's midpoint then lands in
  clear space.

## Audit Checklist

- Does any edge cross an unrelated node?
- Do two edges share the same face slot?
- Is any arrow forced through a corner?
- Is the target entry segment too short?
- Would aligning two nodes make the arrow straight?
- Are waypoint arrays free of duplicate points?

## Default Face Policy

- Left/right faces vary on `Y`.
- Top/bottom faces vary on `X`.
- Use the following sequence when a face has multiple edges:
  - `0.25`
  - `0.5`
  - `0.75`
  - `0.33`
  - `0.66`

## When to Escalate

Use `--strict` when:

- The diagram is paper-facing.
- The diagram is dense enough that routing quality affects readability.
- The output is intended to be reused as a reference asset or screenshot.
