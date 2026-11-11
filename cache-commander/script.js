(function () {
  "use strict";

  const CONFIG = { cols: 13, rows: 10, numBlocks: 16, numSlots: 4 };

  const state = {
    policy: "direct",
    player: { x: 6, y: 3 },
    carrying: null,
    blocks: [],
    slots: [],
    score: 0,
    placed: 0,
    evictions: 0,
    wrong: 0,
    showHints: true,
    log: []
  };

  /* ---------- layout ---------- */
  function blockHome(id) {
    return { x: 2 + (id % 8), y: 5 + Math.floor(id / 8) };
  }
  const SLOT_DEFS = [
    { index: 0, x: 3, y: 2 },
    { index: 1, x: 5, y: 2 },
    { index: 2, x: 7, y: 2 },
    { index: 3, x: 9, y: 2 }
  ];

  function tileType(x, y) {
    if (x === 0 || x === CONFIG.cols - 1 || y === 0 || y === CONFIG.rows - 1) return "wall";
    if (SLOT_DEFS.some(s => s.x === x && s.y === y)) return "slot";
    return "floor";
  }
  function slotIndexAt(x, y) {
    const s = SLOT_DEFS.find(s => s.x === x && s.y === y);
    return s ? s.index : -1;
  }
  function blockColor(id) {
    return "hsl(" + ((id * 37) % 360) + " 68% 58%)";
  }

  /* ---------- DOM ---------- */
  const $ = id => document.getElementById(id);
  const fieldEl = $("field"), overlayEl = $("overlay"), gridWrapEl = $("gridWrap");
  const logEl = $("log"), ruleEl = $("ruleText"), rackEl = $("rack");
  const policySelect = $("policySelect"), hintToggle = $("hintToggle");

  let TILE = 40;

  function sizeGrid() {
    const available = Math.min(window.innerWidth - 40, 640);
    TILE = Math.max(24, Math.min(46, Math.floor(available / CONFIG.cols)));
    gridWrapEl.style.width = TILE * CONFIG.cols + "px";
    gridWrapEl.style.height = TILE * CONFIG.rows + "px";
    layoutStaticTiles();
    render();
  }

  function layoutStaticTiles() {
    fieldEl.innerHTML = "";
    fieldEl.style.width = TILE * CONFIG.cols + "px";
    fieldEl.style.height = TILE * CONFIG.rows + "px";
    for (let y = 0; y < CONFIG.rows; y++) {
      for (let x = 0; x < CONFIG.cols; x++) {
        const type = tileType(x, y);
        const d = document.createElement("div");
        d.className = "tile " + type;
        d.style.left = x * TILE + "px";
        d.style.top = y * TILE + "px";
        d.style.width = TILE + "px";
        d.style.height = TILE + "px";
        if (type === "slot") {
          const idx = slotIndexAt(x, y);
          d.id = "slottile-" + idx;
          const label = document.createElement("div");
          label.className = "slot-label";
          label.style.fontSize = Math.max(9, TILE * 0.26) + "px";
          label.textContent = "S" + idx;
          d.appendChild(label);
        }
        fieldEl.appendChild(d);
      }
    }
  }

  function buildRack() {
    rackEl.innerHTML = "";
    SLOT_DEFS.forEach(s => {
      const card = document.createElement("div");
      card.className = "slot-card";
      card.id = "slotcard-" + s.index;
      card.innerHTML =
        '<div class="sc-name">Slot ' + s.index + "</div>" +
        '<div class="sc-rule"></div>' +
        '<div class="sc-block empty">empty</div>';
      rackEl.appendChild(card);
    });
  }

  /* ---------- policy logic ---------- */
  function policyName() {
    return { direct: "Direct-Mapped", full: "Fully Associative", set2: "2-Way Set-Associative" }[state.policy];
  }
  function ruleLine() {
    if (state.policy === "direct")
      return "Rule: Block N must land in Slot (N mod 4). Exactly one legal slot per block.";
    if (state.policy === "full")
      return "Rule: Any block fits any slot. If the rack is full, walk onto an occupied slot to evict it first.";
    return "Rule: Block N belongs to Set (N mod 2). Set 0 is Slots 0–1, Set 1 is Slots 2–3. Either slot in the set works.";
  }
  function slotRuleText(i) {
    if (state.policy === "direct") return "N mod 4 = " + i;
    if (state.policy === "full") return "any block";
    return "Set " + Math.floor(i / 2) + " · N mod 2 = " + Math.floor(i / 2);
  }
  function isValidSlot(blockId, slotIndex) {
    if (state.policy === "direct") return slotIndex === blockId % CONFIG.numSlots;
    if (state.policy === "full") return true;
    return blockId % (CONFIG.numSlots / 2) === Math.floor(slotIndex / 2);
  }
  function ruleHint(blockId) {
    if (state.policy === "direct") return "it belongs in Slot " + (blockId % CONFIG.numSlots) + ".";
    const s = blockId % (CONFIG.numSlots / 2);
    return "it belongs to Set " + s + " (Slot " + s * 2 + " or " + (s * 2 + 1) + ").";
  }

  /* ---------- actions ---------- */
  function resetGame() {
    state.player = { x: 6, y: 3 };
    state.carrying = null;
    state.score = 0;
    state.placed = 0;
    state.evictions = 0;
    state.wrong = 0;
    state.blocks = Array.from({ length: CONFIG.numBlocks }, (_, id) => {
      const h = blockHome(id);
      return { id, x: h.x, y: h.y, location: "floor" };
    });
    state.slots = SLOT_DEFS.map(s => ({ index: s.index, x: s.x, y: s.y, occupant: null }));
    state.log = [];
    ruleEl.textContent = ruleLine();
    log("New round: " + policyName() + ". " + ruleLine());
    render();
  }

  function log(msg) {
    state.log.unshift(msg);
    state.log = state.log.slice(0, 24);
    logEl.innerHTML = state.log.map(m => "<div>" + escapeHtml(m) + "</div>").join("");
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function tryMove(dx, dy) {
    const nx = state.player.x + dx, ny = state.player.y + dy;
    if (tileType(nx, ny) === "wall") return;
    state.player.x = nx;
    state.player.y = ny;
    renderPlayer();
    renderRack();
  }

  function flash(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function interact() {
    if (state.carrying === null) {
      const block = state.blocks.find(b => b.location === "floor" && b.x === state.player.x && b.y === state.player.y);
      if (block) {
        block.location = "carried";
        state.carrying = block.id;
        log("Picked up Block " + block.id + ".");
      } else {
        log("Nothing here to pick up.");
      }
    } else {
      const slot = state.slots.find(s => s.x === state.player.x && s.y === state.player.y);
      if (!slot) {
        log("Stand on a cache slot to place the block.");
        return;
      }
      if (!isValidSlot(state.carrying, slot.index)) {
        state.wrong += 1;
        log("Block " + state.carrying + " can’t go in Slot " + slot.index + ": " + ruleHint(state.carrying));
        flash($("slottile-" + slot.index), "shake");
        flash($("slotcard-" + slot.index), "shake");
        renderStats();
        return;
      }
      if (slot.occupant !== null) {
        const evicted = state.blocks.find(b => b.id === slot.occupant);
        evicted.location = "floor";
        state.evictions += 1;
        log("Evicted Block " + evicted.id + " from Slot " + slot.index + " back to memory.");
      }
      const block = state.blocks.find(b => b.id === state.carrying);
      block.location = "slot";
      slot.occupant = block.id;
      state.carrying = null;
      state.score += 10;
      state.placed += 1;
      log("Placed Block " + block.id + " into Slot " + slot.index + ". +10");
      flash($("slottile-" + slot.index), "pop");
      flash($("slotcard-" + slot.index), "pop");
    }
    render();
  }

  /* ---------- rendering ---------- */
  function render() {
    renderBlocks();
    renderSlots();
    renderRack();
    renderPlayer();
    renderStats();
  }

  function renderBlocks() {
    overlayEl.querySelectorAll(".ov-block").forEach(n => n.remove());
    state.blocks.filter(b => b.location === "floor").forEach(b => {
      const d = document.createElement("div");
      d.className = "ov ov-block";
      d.style.left = b.x * TILE + "px";
      d.style.top = b.y * TILE + "px";
      d.style.width = TILE + "px";
      d.style.height = TILE + "px";
      const chip = document.createElement("div");
      chip.className = "block-item";
      chip.style.background = blockColor(b.id);
      chip.style.fontSize = Math.max(11, TILE * 0.32) + "px";
      chip.textContent = b.id;
      d.appendChild(chip);
      overlayEl.appendChild(d);
    });
  }

  function legalNow(slotIndex) {
    return state.showHints && state.carrying !== null && isValidSlot(state.carrying, slotIndex);
  }

  // slot tiles inside the field: show slot number (top) AND the block inside (bottom)
  function renderSlots() {
    state.slots.forEach(s => {
      const tile = $("slottile-" + s.index);
      if (!tile) return;
      tile.classList.toggle("valid", legalNow(s.index));
      let chip = tile.querySelector(".slot-chip");
      if (s.occupant !== null) {
        if (!chip) {
          chip = document.createElement("div");
          chip.className = "slot-chip";
          tile.appendChild(chip);
        }
        chip.style.background = blockColor(s.occupant);
        chip.style.fontSize = Math.max(10, TILE * 0.3) + "px";
        chip.textContent = s.occupant;
      } else if (chip) {
        chip.remove();
      }
    });
  }

  // rack panel above the field: "Slot 2 / N mod 4 = 2 / Block 6"
  function renderRack() {
    const here = slotIndexAt(state.player.x, state.player.y);
    state.slots.forEach(s => {
      const card = $("slotcard-" + s.index);
      if (!card) return;
      card.classList.toggle("valid", legalNow(s.index));
      card.classList.toggle("here", here === s.index);
      card.querySelector(".sc-rule").textContent = slotRuleText(s.index);
      const b = card.querySelector(".sc-block");
      if (s.occupant === null) {
        b.className = "sc-block empty";
        b.style.background = "";
        b.textContent = "empty";
      } else {
        b.className = "sc-block full";
        b.style.background = blockColor(s.occupant);
        b.textContent = "Block " + s.occupant;
      }
    });
  }

  let playerEl = null, carryBadgeEl = null;
  function renderPlayer() {
    if (!playerEl) {
      playerEl = document.createElement("div");
      playerEl.id = "player";
      playerEl.className = "ov";
      const face = document.createElement("div");
      face.className = "face";
      face.textContent = "🧑‍🚀";
      carryBadgeEl = document.createElement("div");
      carryBadgeEl.id = "carryBadge";
      playerEl.appendChild(carryBadgeEl);
      playerEl.appendChild(face);
      overlayEl.appendChild(playerEl);
    }
    playerEl.style.left = state.player.x * TILE + "px";
    playerEl.style.top = state.player.y * TILE + "px";
    playerEl.style.width = TILE + "px";
    playerEl.style.height = TILE + "px";
    playerEl.querySelector(".face").style.fontSize = Math.max(14, TILE * 0.52) + "px";
    if (state.carrying !== null) {
      carryBadgeEl.style.display = "block";
      carryBadgeEl.textContent = "B" + state.carrying;
    } else {
      carryBadgeEl.style.display = "none";
    }
  }

  function renderStats() {
    $("statScore").textContent = state.score;
    $("statPlaced").textContent = state.placed;
    $("statEvict").textContent = state.evictions;
    $("statWrong").textContent = state.wrong;
    $("statCarry").textContent = state.carrying === null ? "none" : "Block " + state.carrying;
  }

  /* ---------- input ---------- */
  const pressed = new Set();
  const moveKeys = new Set(["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"]);

  window.addEventListener("keydown", e => {
    if (e.target && e.target.tagName === "SELECT") return;
    const k = e.key.toLowerCase();
    if (moveKeys.has(k)) { e.preventDefault(); pressed.add(k); }
    if (k === " " || k === "e") { e.preventDefault(); interact(); }
    if (k === "r") resetGame();
  });
  window.addEventListener("keyup", e => pressed.delete(e.key.toLowerCase()));

  let lastStep = 0;
  function loop(ts) {
    if (ts - lastStep > 135) {
      let dx = 0, dy = 0;
      if (pressed.has("arrowup") || pressed.has("w")) dy = -1;
      else if (pressed.has("arrowdown") || pressed.has("s")) dy = 1;
      else if (pressed.has("arrowleft") || pressed.has("a")) dx = -1;
      else if (pressed.has("arrowright") || pressed.has("d")) dx = 1;
      if (dx || dy) { tryMove(dx, dy); lastStep = ts; }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  document.querySelectorAll(".touch [data-dir]").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = btn.getAttribute("data-dir");
      if (d === "up") tryMove(0, -1);
      if (d === "down") tryMove(0, 1);
      if (d === "left") tryMove(-1, 0);
      if (d === "right") tryMove(1, 0);
      btn.blur();
    });
  });
  $("actBtn").addEventListener("click", e => { interact(); e.currentTarget.blur(); });
  $("resetBtn").addEventListener("click", e => { resetGame(); e.currentTarget.blur(); });
  $("themeBtn").addEventListener("click", e => {
    const cur = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", cur === "dark" ? "light" : "dark");
    e.currentTarget.blur();
  });
  policySelect.addEventListener("change", () => {
    state.policy = policySelect.value;
    policySelect.blur();
    resetGame();
  });
  hintToggle.addEventListener("change", () => {
    state.showHints = hintToggle.checked;
    hintToggle.blur();
    renderSlots();
    renderRack();
  });
  window.addEventListener("resize", sizeGrid);

  /* ---------- init ---------- */
  buildRack();
  sizeGrid();
  resetGame();
})();
