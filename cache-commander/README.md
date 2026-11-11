# Cache Commander

A grid-based mini-game that turns cache mapping policies into something you physically act out: pick up a memory block, carry it to the cache rack, and the mapping rule decides whether the slot you picked is legal.

Open `index.html` in any browser.

## How to play

| Action | Keys |
|---|---|
| Move | Arrow keys or WASD |
| Pick up / place | Space or E |
| Reset round | R |

On touch devices, use the on-screen D-pad and the central round button.

## The three modes

- **Direct-Mapped** — Block N must go in Slot `N mod 4`. Exactly one legal slot per block.
- **Fully Associative** — any block fits any slot. When the rack is full, walking onto an occupied slot evicts its occupant back to memory.
- **2-Way Set-Associative** — slots are paired into sets. Block N belongs to Set `N mod 2`. Either slot in that set accepts it.

## Scoring

- **+10** for each legal placement.
- **wrong slots** counter increments when you try to place a block somewhere the policy won't allow (the slot shakes and rejects).
- **evictions** counts how many blocks you displaced back to memory.

## Teaching tip

Run the same handful of blocks under each policy in turn — the eviction count and "wrong slots" count tell the whole story of why associativity matters.

## Files

- `index.html` — markup and controls
- `style.css` — tokens, grid layout, theming (light/dark)
- `script.js` — game state, policy rules, rendering loop
