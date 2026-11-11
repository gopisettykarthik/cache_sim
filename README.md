# Cache Memory — Simulator & Game

An interactive two-part project for **ECE2002 Computer Architecture and Design** (VIT-AP University, Slot B1) that explains cache memory at the hardware level — how an address is split into tag / index / offset, how direct, set-associative and fully-associative mappings differ, and how replacement policies decide what gets evicted.

**Submitted by:** Gopisetty Karthik · Reg. No. 25BCA7275
**Faculty:** Agam Das Goswami
**Course:** ECE2002 — Computer Architecture and Design
**Slot:** B1

---

## What's in this repo

| Folder | What it is |
|---|---|
| [`simulator/`](./simulator) | **Cache Memory Simulator** — configure cache geometry, feed it addresses, watch every hit, miss and eviction with live address decoding. |
| [`cache-commander/`](./cache-commander) | **Cache Commander** — a grid-based game where you physically carry memory blocks into cache slots under the rules of each mapping policy. |
| [`report/`](./report) | Activity Report (Word document) covering theory, design, implementation and verification. |
| [`docs/`](./docs) | Presentation notes, demo script and Q&A prep. |

---

## Quick start

Everything in this project runs in a browser. No install, no build step.

**Simulator:**
```
Open simulator/index.html in any modern browser.
```

**Cache Commander (game):**
```
Open cache-commander/index.html in any modern browser.
```

Both work offline. To host live, enable **GitHub Pages** on this repo (see bottom of this README).

---

## The simulator at a glance

- 8-bit address space (256 B of main memory) kept exam-sized.
- Configurable cache size (32/64/128 B), block size (4/8/16 B), associativity (direct / 2-way / 4-way / fully) and replacement policy (LRU / FIFO / Random).
- Live address-decode strip showing tag | index | offset bits colour-coded.
- Cache table with valid bit, tag, block range and policy timestamps.
- Hit/miss/eviction statistics with hit-rate percentage.
- Three preset access sequences: Sequential sweep, Loop ×2, Conflict thrash.

## Cache Commander at a glance

- Pick one of three mapping policies: Direct-Mapped, Fully Associative, 2-Way Set-Associative.
- Walk your astronaut around a grid, pick up memory blocks, carry them to cache slots.
- Each policy enforces its own rule for where a block is allowed to land.
- Score goes up for legal placements, eviction counter tracks forced displacements, wrong-slot attempts shake and reject.
- Keyboard: arrows / WASD to move, Space / E to pick up or place, R to reset.

---

## Topics demonstrated

- Why caches exist — temporal and spatial locality
- Address decomposition (tag / index / offset bit widths)
- Direct mapped, k-way set associative, fully associative
- LRU, FIFO and random replacement policies
- The 3Cs model of misses (compulsory / conflict / capacity)
- Hit rate as a function of associativity and access pattern

---

## Serving it live (optional — GitHub Pages)

After pushing this repo:

1. Go to the repo on github.com
2. **Settings** → **Pages**
3. Under *Build and deployment*, set source to **Deploy from a branch**, branch **main**, folder **/ (root)**
4. Save. After a minute, the simulator will be live at:
   `https://gopisettykarthik.github.io/cache_sim/simulator/`
   and the game at:
   `https://gopisettykarthik.github.io/cache_sim/cache-commander/`

---

## License

MIT — see [`LICENSE`](./LICENSE).
