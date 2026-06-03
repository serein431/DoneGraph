(() => {
  const shell = document.querySelector("[data-live-world]");
  const host = document.querySelector("[data-vibecraft-game]");
  if (!shell || !host) return;

  const hud = {
    hint: shell.querySelector("[data-live-hint]"),
    action: shell.querySelector("[data-live-action]"),
    actionTitle: shell.querySelector("[data-live-action-title]"),
    actionCopy: shell.querySelector("[data-live-action-copy]"),
    actionButton: shell.querySelector("[data-live-action-button]"),
    health: shell.querySelector("[data-live-tree-health]"),
    healthMeter: shell.querySelector("[data-live-tree-meter]"),
    radio: shell.querySelector("[data-live-radio-copy]"),
    radioButton: shell.querySelector("[data-live-radio-button]"),
    minimapDot: shell.querySelector("[data-live-minimap-dot]"),
    xp: shell.querySelector("[data-live-xp]"),
    slots: Array.from(shell.querySelectorAll("[data-live-slot]")),
    loading: shell.querySelector("[data-live-loading]")
  };

  const lens = {
    modal: document.querySelector("[data-vibe-lens-modal]"),
    video: document.querySelector("[data-vibe-lens-video]"),
    start: document.querySelector("[data-vibe-lens-start]"),
    scan: document.querySelector("[data-vibe-lens-scan]"),
    close: document.querySelector("[data-vibe-lens-close]"),
    result: document.querySelector("[data-vibe-lens-result]")
  };

  const state = {
    treeHealth: 100,
    xp: 12,
    inventory: ["AXE", "MAP", "RADIO", "LENS"],
    activeLocation: null,
    activeAction: null,
    stream: null,
    audioContext: null,
    radioIndex: 0
  };

  const locations = {
    spawn: {
      label: "Spawn",
      title: "Spawn Point",
      copy: "Copy an Agent command here, then bring back the Village Pass proof.",
      x: 168,
      y: 366,
      color: 0xf3c84d,
      action: "spawn"
    },
    goalTree: {
      label: "Goal Tree",
      title: "Goal Tree",
      copy: "Chop the task tree. Each Agent completion proof turns into real progress.",
      x: 424,
      y: 284,
      color: 0x4faa42,
      action: "chop"
    },
    mine: {
      label: "Knowledge Mine",
      title: "Knowledge Mine",
      copy: "Mine confusing terms into blocks you can understand and reuse.",
      x: 760,
      y: 210,
      color: 0x8e969c,
      action: "mine"
    },
    craft: {
      label: "Crafting Table",
      title: "Crafting Table",
      copy: "Turn mined blocks into plain-language cards for tomorrow.",
      x: 680,
      y: 388,
      color: 0xad7442,
      action: "craft"
    },
    radio: {
      label: "Radio Tower",
      title: "Vibe Radio",
      copy: "Play a build broadcast so progress feels like a living world.",
      x: 548,
      y: 132,
      color: 0xcf3d33,
      action: "radio"
    },
    lens: {
      label: "Vibe Lens",
      title: "Vibe Lens",
      copy: "Use camera input to bring real-world notes, words, and screenshots into the world.",
      x: 250,
      y: 206,
      color: 0x36a6dc,
      action: "lens"
    },
    brain: {
      label: "Brain Vault",
      title: "Vibe Brain Vault",
      copy: "Store distilled memory and grant scoped keys to future Agents.",
      x: 836,
      y: 360,
      color: 0x8d63ff,
      action: "brain"
    },
    village: {
      label: "Vibe Village",
      title: "Vibe Village",
      copy: "Meet builders with complementary skills and invite them to build.",
      x: 306,
      y: 448,
      color: 0x72bd49,
      action: "village"
    }
  };

  const radioLines = [
    "Radio Tower: Today your Agent turned a fuzzy goal into visible progress. The Goal Tree is ready for another hit.",
    "Radio Tower: Knowledge Mine detected API, Deploy, Prompt, and Error blocks. Bring one to the Crafting Table.",
    "Radio Tower: Village signal is open. Your public Vibe Bio now explains what you can build with others."
  ];

  const updateHud = () => {
    if (hud.health) hud.health.textContent = `${state.treeHealth}%`;
    if (hud.healthMeter) hud.healthMeter.style.setProperty("--tree-health", `${state.treeHealth}%`);
    if (hud.xp) hud.xp.textContent = `Lv.${state.xp}`;
    hud.slots.forEach((slot, index) => {
      slot.textContent = state.inventory[index] || "";
      slot.classList.toggle("is-active", index === 0);
    });
  };

  const setHint = (text) => {
    if (hud.hint) hud.hint.textContent = text;
  };

  const showAction = (location) => {
    state.activeLocation = location;
    state.activeAction = location.action;
    if (hud.actionTitle) hud.actionTitle.textContent = location.title;
    if (hud.actionCopy) hud.actionCopy.textContent = location.copy;
    if (hud.actionButton) hud.actionButton.textContent = getActionLabel(location.action);
    hud.action?.classList.add("is-visible");
  };

  const hideAction = () => {
    state.activeLocation = null;
    state.activeAction = null;
    hud.action?.classList.remove("is-visible");
  };

  const getActionLabel = (action) => {
    const labels = {
      spawn: "Open Agent Register",
      chop: "Chop Goal Tree",
      mine: "Mine Knowledge",
      craft: "Craft Card",
      radio: "Play Broadcast",
      lens: "Open Vibe Lens",
      brain: "Forge Access Key",
      village: "Invite Builder"
    };
    return labels[action] || "Interact";
  };

  const primeAudio = () => {
    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) state.audioContext = new AudioContext();
    }
    if (state.audioContext?.state === "suspended") state.audioContext.resume();
  };

  const beep = (frequency = 520, duration = 0.09, gain = 0.08) => {
    primeAudio();
    if (!state.audioContext) return;
    const now = state.audioContext.currentTime;
    const oscillator = state.audioContext.createOscillator();
    const volume = state.audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, now);
    volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(volume);
    volume.connect(state.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const syncExistingQuestHud = () => {
    document.querySelector("[data-tree-health]")?.replaceChildren(document.createTextNode(`${state.treeHealth}%`));
    const tree = document.querySelector("[data-goal-tree]");
    if (tree) {
      tree.classList.toggle("is-complete", state.treeHealth <= 0);
    }
    document.querySelector("[data-goal-achievement]")?.classList.toggle("is-visible", state.treeHealth <= 0);
  };

  const dispatchWorldEvent = (type, detail = {}) => {
    window.dispatchEvent(new CustomEvent("vibecraft:world", { detail: { type, ...detail } }));
  };

  const runAction = () => {
    if (!state.activeAction) return;
    const action = state.activeAction;
    beep(460);
    if (action === "spawn") {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHint("Spawn opened: copy the Agent command and bring back the authorization proof.");
    }
    if (action === "chop") {
      state.treeHealth = Math.max(0, state.treeHealth - 20);
      state.xp += 1;
      if (!state.inventory.includes("WOOD")) state.inventory.push("WOOD");
      setHint(state.treeHealth <= 0 ? "Goal shipped. The tree dropped an achievement and skill XP." : "Axe hit landed. Agent proof became visible progress.");
      syncExistingQuestHud();
      dispatchWorldEvent("chop", { treeHealth: state.treeHealth });
    }
    if (action === "mine") {
      const next = ["API", "ERROR", "DEPLOY", "PROMPT"].find((item) => !state.inventory.includes(item));
      if (next) state.inventory.push(next);
      state.xp += 1;
      setHint(next ? `${next} block mined. Bring it to the Crafting Table.` : "Mine is clear for now. All starter blocks are in your inventory.");
      dispatchWorldEvent("mine", { inventory: state.inventory });
    }
    if (action === "craft") {
      if (!state.inventory.includes("CARD")) state.inventory.push("CARD");
      setHint("Crafted: a confusing block became a plain-language card.");
      dispatchWorldEvent("craft", { inventory: state.inventory });
    }
    if (action === "radio") {
      playRadio();
    }
    if (action === "lens") {
      openLens();
    }
    if (action === "brain") {
      if (!state.inventory.includes("KEY")) state.inventory.push("KEY");
      setHint("Brain Vault forged a scoped memory key for future Agents.");
      dispatchWorldEvent("brain", { inventory: state.inventory });
    }
    if (action === "village") {
      if (!state.inventory.includes("INVITE")) state.inventory.push("INVITE");
      setHint("Collaboration signal sent. A complementary builder can understand your role quickly.");
      dispatchWorldEvent("village", { inventory: state.inventory });
    }
    updateHud();
    const scene = window.vibeCraftPlayableWorld?.game?.scene?.keys?.VibeCraftWorldScene;
    if (scene) {
      scene.lockedActionKey = null;
      scene.lastNearKey = null;
    }
  };

  const playRadio = () => {
    const line = radioLines[state.radioIndex % radioLines.length];
    state.radioIndex += 1;
    if (hud.radio) hud.radio.textContent = line;
    setHint("Vibe Radio broadcast played.");
    beep(330, 0.08, 0.07);
    window.setTimeout(() => beep(440, 0.08, 0.06), 90);
    dispatchWorldEvent("radio", { line });
  };

  const openLens = () => {
    if (!lens.modal) return;
    lens.modal.classList.add("is-open");
    if (lens.result) lens.result.textContent = "Lens ready. Start camera, then scan a note, word, screen, or sketch.";
  };

  const closeLens = () => {
    lens.modal?.classList.remove("is-open");
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      state.stream = null;
    }
    if (lens.video) lens.video.srcObject = null;
  };

  const startLensCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      if (lens.result) lens.result.textContent = "Camera is unavailable here. In production this becomes upload fallback plus HTTPS camera mode.";
      return;
    }
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (lens.video) {
        lens.video.srcObject = state.stream;
        await lens.video.play();
      }
      if (lens.result) lens.result.textContent = "Camera connected. Aim at a note, word, screenshot, or sketch.";
      beep(620);
    } catch (error) {
      if (lens.result) lens.result.textContent = "Camera permission was not granted. The fallback is to upload or paste an image in the next build.";
    }
  };

  const scanLensFrame = () => {
    if (!state.inventory.includes("LENS-BLOCK")) state.inventory.push("LENS-BLOCK");
    if (lens.result) {
      lens.result.textContent = "Scanned into world: one real-world input became a Knowledge Block. Next step: send it to the Crafting Table.";
    }
    setHint("Vibe Lens created a Knowledge Block from real-world input.");
    updateHud();
    beep(760);
    dispatchWorldEvent("lens", { inventory: state.inventory });
  };

  lens.start?.addEventListener("click", startLensCamera);
  lens.scan?.addEventListener("click", scanLensFrame);
  lens.close?.addEventListener("click", closeLens);
  lens.modal?.addEventListener("click", (event) => {
    if (event.target === lens.modal) closeLens();
  });
  hud.actionButton?.addEventListener("click", runAction);
  hud.radioButton?.addEventListener("click", playRadio);

  if (!window.Phaser) {
    setHint("Game engine failed to load. Check the local Phaser vendor file.");
    return;
  }

  class VibeCraftWorldScene extends Phaser.Scene {
    constructor() {
      super("VibeCraftWorldScene");
      this.player = null;
      this.target = null;
      this.speed = 185;
      this.keys = null;
      this.locationSprites = new Map();
      this.lastNearKey = null;
      this.lockedActionKey = null;
      this.locationPointerActive = false;
    }

    create() {
      this.cameras.main.setBackgroundColor("#72c9f5");
      this.drawWorld();
      this.createLocations();
      this.createPlayer();
      this.createInput();
      this.createAmbientMotion();
      updateHud();
      shell.classList.add("is-loaded");
      setHint("Click anywhere to walk. Click a place, then use the action prompt.");
      if (hud.loading) hud.loading.setAttribute("aria-hidden", "true");
    }

    drawWorld() {
      const g = this.add.graphics();
      g.fillStyle(0x72c9f5, 1);
      g.fillRect(0, 0, 960, 540);
      this.drawCloud(g, 120, 70);
      this.drawCloud(g, 700, 66);
      this.drawCloud(g, 822, 120);
      g.fillStyle(0x4fa548, 1);
      g.fillRect(0, 290, 960, 250);
      g.fillStyle(0x3e8c34, 1);
      for (let y = 302; y < 540; y += 36) {
        for (let x = (y / 36) % 2 ? 0 : 18; x < 960; x += 36) {
          g.fillRect(x, y, 18, 18);
        }
      }
      this.drawRiver(g);
      this.drawPath(g, [
        [168, 366],
        [306, 448],
        [424, 284],
        [548, 132],
        [680, 388],
        [836, 360]
      ]);
      this.drawPath(g, [
        [424, 284],
        [760, 210]
      ]);
      this.drawPath(g, [
        [306, 448],
        [250, 206]
      ]);
      this.drawBlockHill(g, 760, 156);
      this.drawVillageBase(g, 304, 430);
    }

    drawCloud(g, x, y) {
      g.fillStyle(0xf7fdff, 1);
      g.fillRect(x, y, 54, 20);
      g.fillRect(x + 22, y - 18, 42, 18);
      g.fillRect(x + 64, y + 6, 36, 16);
    }

    drawRiver(g) {
      g.fillStyle(0x2b95cf, 1);
      g.fillRect(0, 434, 960, 62);
      g.fillStyle(0x37b5e5, 1);
      for (let x = 0; x < 960; x += 42) g.fillRect(x, 452, 24, 6);
    }

    drawPath(g, points) {
      g.lineStyle(22, 0xcaa16a, 1);
      g.beginPath();
      g.moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => g.lineTo(x, y));
      g.strokePath();
      g.lineStyle(4, 0x6b4529, 1);
      g.strokePath();
    }

    drawBlockHill(g, x, y) {
      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 6 - row; col += 1) {
          g.fillStyle(row > 2 ? 0x5f666c : 0x7b8388, 1);
          g.fillRect(x + col * 34 - row * 17, y + row * 24, 34, 24);
          g.lineStyle(2, 0x30363a, .4);
          g.strokeRect(x + col * 34 - row * 17, y + row * 24, 34, 24);
        }
      }
    }

    drawVillageBase(g, x, y) {
      g.fillStyle(0xad7442, 1);
      g.fillRect(x - 54, y - 38, 108, 56);
      g.fillStyle(0x6d4024, 1);
      g.fillRect(x - 72, y - 56, 144, 20);
      g.fillStyle(0xfff2c8, 1);
      g.fillRect(x - 16, y - 18, 32, 36);
    }

    createLocations() {
      Object.entries(locations).forEach(([key, location]) => {
        const object = this.add.container(location.x, location.y);
        const base = this.add.rectangle(0, 0, 118, 46, 0x1b130c, .86)
          .setStrokeStyle(4, 0x120a05)
          .setInteractive({ useHandCursor: true });
        const label = this.add.text(0, 0, location.label, {
          fontFamily: "Arial Black, Arial",
          fontSize: "12px",
          color: "#fff7d6",
          align: "center",
          stroke: "#000000",
          strokeThickness: 3
        }).setOrigin(.5);
        const icon = this.drawLocationIcon(key, location.color);
        object.add([icon, base, label]);
        object.setDepth(location.y);
        base.on("pointerdown", (pointer) => {
          pointer.event.stopPropagation();
          this.locationPointerActive = true;
          this.lockedActionKey = key;
          this.walkTo(location.x, location.y + 48);
          showAction(location);
          setHint(`Walking to ${location.title}.`);
          beep(390, 0.06, 0.05);
        });
        this.locationSprites.set(key, object);
      });
    }

    drawLocationIcon(key, color) {
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      if (key === "goalTree") {
        g.fillRect(-15, -74, 30, 50);
        g.fillStyle(0x2f7b2d, 1);
        g.fillRect(-45, -110, 90, 54);
        g.fillRect(-28, -134, 56, 36);
      } else if (key === "radio") {
        g.fillRect(-8, -118, 16, 96);
        g.fillRect(-34, -104, 68, 12);
        g.fillRect(-24, -72, 48, 10);
      } else if (key === "mine") {
        g.fillRect(-54, -86, 108, 68);
        g.fillStyle(0x161616, 1);
        g.fillRect(-26, -64, 52, 46);
      } else if (key === "craft") {
        g.fillRect(-38, -62, 76, 44);
        g.fillStyle(0x6d4024, 1);
        g.fillRect(-30, -54, 60, 10);
      } else if (key === "lens") {
        g.fillRect(-42, -78, 84, 58);
        g.fillStyle(0xf7fdff, 1);
        g.fillRect(-16, -64, 32, 26);
      } else if (key === "brain") {
        g.fillRect(-46, -82, 92, 64);
        g.fillStyle(0x2b203b, 1);
        g.fillRect(-18, -62, 36, 34);
      } else if (key === "village" || key === "spawn") {
        g.fillRect(-42, -66, 84, 48);
        g.fillStyle(0x6d4024, 1);
        g.fillRect(-54, -82, 108, 20);
      }
      g.lineStyle(4, 0x120a05, 1);
      g.strokeRect(-52, -82, 104, 64);
      return g;
    }

    createPlayer() {
      this.player = this.add.container(168, 424);
      const shadow = this.add.ellipse(0, 24, 42, 14, 0x000000, .24);
      const legs = this.add.rectangle(0, 18, 30, 22, 0x2f6dba).setStrokeStyle(3, 0x120a05);
      const body = this.add.rectangle(0, -8, 36, 42, 0x4fa548).setStrokeStyle(3, 0x120a05);
      const head = this.add.rectangle(0, -42, 34, 34, 0xf1c39c).setStrokeStyle(3, 0x120a05);
      const hair = this.add.rectangle(0, -56, 34, 10, 0x5d331d);
      const eyeA = this.add.rectangle(-7, -42, 4, 4, 0x120a05);
      const eyeB = this.add.rectangle(7, -42, 4, 4, 0x120a05);
      const axe = this.add.rectangle(24, -14, 8, 48, 0x6d4024).setRotation(-.55);
      const axeHead = this.add.rectangle(36, -36, 18, 16, 0xcfd7dc).setRotation(-.55).setStrokeStyle(2, 0x120a05);
      this.player.add([shadow, legs, body, head, hair, eyeA, eyeB, axe, axeHead]);
      this.player.setDepth(999);
      this.tweens.add({
        targets: this.player,
        y: this.player.y - 4,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    createInput() {
      this.keys = this.input.keyboard?.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE");
      this.input.on("pointerdown", (pointer) => {
        if (this.locationPointerActive) {
          this.locationPointerActive = false;
          return;
        }
        this.lockedActionKey = null;
        this.walkTo(pointer.x, pointer.y);
        hideAction();
      });
    }

    createAmbientMotion() {
      this.locationSprites.forEach((object, key) => {
        this.tweens.add({
          targets: object,
          y: object.y - (key === "radio" ? 5 : 3),
          duration: 900 + Math.random() * 360,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      });
    }

    walkTo(x, y) {
      this.target = new Phaser.Math.Vector2(
        Phaser.Math.Clamp(x, 42, 918),
        Phaser.Math.Clamp(y, 132, 504)
      );
    }

    update(time, delta) {
      if (!this.player) return;
      const dt = delta / 1000;
      const velocity = new Phaser.Math.Vector2(0, 0);
      if (this.keys) {
        if (this.keys.A?.isDown || this.keys.LEFT?.isDown) velocity.x -= 1;
        if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) velocity.x += 1;
        if (this.keys.W?.isDown || this.keys.UP?.isDown) velocity.y -= 1;
        if (this.keys.S?.isDown || this.keys.DOWN?.isDown) velocity.y += 1;
      }
      if (velocity.lengthSq() > 0) {
        this.target = null;
        velocity.normalize().scale(this.speed * dt);
        this.player.x = Phaser.Math.Clamp(this.player.x + velocity.x, 42, 918);
        this.player.y = Phaser.Math.Clamp(this.player.y + velocity.y, 132, 504);
      } else if (this.target) {
        const toTarget = new Phaser.Math.Vector2(this.target.x - this.player.x, this.target.y - this.player.y);
        const distance = toTarget.length();
        if (distance < 5) {
          this.player.x = this.target.x;
          this.player.y = this.target.y;
          this.target = null;
        } else {
          toTarget.normalize().scale(Math.min(distance, this.speed * dt));
          this.player.x += toTarget.x;
          this.player.y += toTarget.y;
        }
      }
      this.player.setDepth(this.player.y + 300);
      this.updateMiniMap();
      this.checkNearbyLocation();
    }

    updateMiniMap() {
      if (!hud.minimapDot) return;
      const x = Phaser.Math.Clamp((this.player.x / 960) * 100, 3, 97);
      const y = Phaser.Math.Clamp((this.player.y / 540) * 100, 3, 97);
      hud.minimapDot.style.setProperty("--mini-x", `${x}%`);
      hud.minimapDot.style.setProperty("--mini-y", `${y}%`);
    }

    checkNearbyLocation() {
      if (this.lockedActionKey && locations[this.lockedActionKey]) {
        const locked = locations[this.lockedActionKey];
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, locked.x, locked.y + 48);
        if (distance < 78) setHint(`Near ${locked.title}. Use the action button or press Space.`);
        if (this.keys?.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
          runAction();
          this.lockedActionKey = null;
        }
        return;
      }
      let nearestKey = null;
      let nearestDistance = Infinity;
      Object.entries(locations).forEach(([key, location]) => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, location.x, location.y + 48);
        if (distance < nearestDistance) {
          nearestKey = key;
          nearestDistance = distance;
        }
      });
      if (nearestDistance < 78 && nearestKey !== this.lastNearKey) {
        const location = locations[nearestKey];
        showAction(location);
        setHint(`Near ${location.title}. Use the action button or press Space.`);
        this.lastNearKey = nearestKey;
      }
      if (nearestDistance >= 96 && this.lastNearKey) {
        hideAction();
        this.lastNearKey = null;
      }
      if (this.keys?.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
        runAction();
        this.lockedActionKey = null;
      }
    }
  }

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent: host,
    backgroundColor: "#72c9f5",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540
    },
    render: {
      pixelArt: true,
      antialias: false
    },
    scene: VibeCraftWorldScene
  });

  window.vibeCraftPlayableWorld = {
    game,
    state,
    runAction,
    playRadio,
    openLens
  };
})();
