# Cache Memory Simulator

Open `index.html` in any browser. No build, no server.

## Using it

1. Pick a cache geometry from the sidebar — size, block size, associativity, replacement policy. The right side updates to show the derived number of lines, sets, and the exact bit split of an 8-bit address.
2. Type a hex or decimal address into the input (0x00–0xFF). Hit **Access address** or press Enter.
3. The decode strip colour-codes which bits are tag, which are index, and which are offset. The cache table highlights the target set, then shows HIT or MISS, and an eviction if one happened.
4. The **Random** button throws a random address at it. **Demo sequence** runs one of three canned access patterns for teaching.

## Demo sequences

- **Sequential sweep** — walks consecutive addresses to show spatial locality (one miss per block, then hits).
- **Loop ×2** — hits a handful of addresses twice to show temporal locality (all misses first pass, all hits second pass if they fit).
- **Conflict thrash** — two addresses that map to the same set under direct mapping. Watch 100% misses, then switch to 2-way and watch 0% misses on the same sequence.

## Keyboard

- Enter in the address box: access the entered address.
