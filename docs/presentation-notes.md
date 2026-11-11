# Presentation & Q&A Notes

A cheat-sheet for presenting the simulator + Cache Commander and defending the design in Q&A.

## Opening (30 seconds)

> "Cache sits between CPU and main memory. It's small and fast, main memory is big and slow. This project has two parts — a simulator that shows the internal mechanics of a cache, and a game, Cache Commander, that turns the mapping rules into something you physically carry out."

## Demo order

1. **Simulator — default config** (64 B cache, 8 B blocks, direct mapped). Point at the derived values on the right: 8 lines, 8 sets, 3 offset bits, 3 index bits, 2 tag bits.
2. **Access `0x2C`.** Watch the decode strip colour the tag/index/offset. Target is set 5. Cold miss, block loaded.
3. **Access `0x2D`** immediately after. HIT — same block, different byte. That's spatial locality.
4. **Run "Conflict thrash"** preset. 6 accesses, 6 misses, 0% hit rate.
5. **Switch to 2-way set associative, run thrash again.** Hit rate jumps to 66.7%. This single comparison is the whole argument for associativity.
6. **Open Cache Commander.** Pick direct-mapped. Walk Block 0 to Slot 0 — legal, +10. Try Block 0 in Slot 1 — slot shakes, rejected. Switch to 2-way, show Block 0 is now legal in Slot 0 or Slot 1.

## Core formulas to memorise

```
offset_bits = log2(block_size)
index_bits  = log2(number_of_sets)
tag_bits    = address_bits − index_bits − offset_bits

number_of_lines = cache_size / block_size
number_of_sets  = number_of_lines / associativity
```

## Worked example — know this cold

**Given:** 8-bit address, 64 B cache, 8 B blocks, 2-way set associative
- lines = 64/8 = 8
- sets = 8/2 = 4
- offset = log₂(8) = **3 bits**
- index = log₂(4) = **2 bits**
- tag = 8 − 2 − 3 = **3 bits**

**Address `0x5A = 0101 1010`:**
- offset = `010` = byte 2
- index = `11` = set 3
- tag = `010`

## One-liner answers to the three mapping schemes

| Scheme | Rule | Trade-off |
|---|---|---|
| Direct mapped | `line = block mod L` | Fastest, but conflict misses |
| k-way set associative | `set = block mod S`, any of k ways | Balanced — what real CPUs use |
| Fully associative | Any line, no index at all | Zero conflict misses, expensive hardware |

## The 3Cs of misses

- **Compulsory (cold)** — first time touching a block. Unavoidable.
- **Conflict** — evicted because another block mapped to the same set. Fixed by associativity.
- **Capacity** — working set exceeds cache size. Fixed by a bigger cache.

## Replacement policies

- **LRU** — kick out longest-unused. Best hit rate, needs per-line tracking.
- **FIFO** — kick out oldest-loaded regardless of recent use. Simpler.
- **Random** — pick any. Dirt cheap, surprisingly competitive.
- Direct-mapped has no policy — one legal spot, that's the victim.

## Likely Q&A

**Q: Why 8-bit addresses?**
"So the math fits on screen. Algorithm is identical at 32/64 bit, just wider fields."

**Q: Block vs line?**
"Block lives in memory, line is the cache slot that holds it. Interchangeable in casual speech."

**Q: Why not fully associative everywhere?**
"Hardware cost — needs one comparator per line running in parallel. Set associative is the sweet spot."

**Q: What about writes?**
"This sim is read-only. Write policies would add write-through (write both immediately) vs write-back (dirty bit, flush on evict)."

**Q: How is LRU implemented?**
"Monotonic clock counter. Each line stores `lastUsed`; on eviction, pick the smallest. FIFO uses `loadedAt` instead, same mechanism."

**Q: Why async/await for the animation?**
"To show each phase separately — decode, highlight, verdict, fill. Also honors `prefers-reduced-motion` for accessibility."

**Q: Why no React?**
"~700 lines of logic, no complex state tree. Zero deps means it runs anywhere and loads instantly."

**Q: What's AMAT?**
"Average Memory Access Time = hit_time + miss_rate × miss_penalty."

**Q: Why two separate apps?**
"Simulator shows the internal state — tag arrays, valid bits, timestamps. The game shows the external behaviour — legal vs illegal placement from the user's POV. Together they cover both abstraction levels."

## Traps to avoid

- Don't mix up **set** and **way**. A 4-way cache has sets; each set has 4 ways.
- Fully associative has **zero index bits**. Common exam slip.
- Always state your assumed address width.
