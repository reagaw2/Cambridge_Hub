/**
 * LogicCircuitCanvas — interactive logic gate diagram builder for CS exam questions.
 * Supports AND, OR, NOT, NAND, NOR, XOR, XNOR gates with wire drawing.
 * Saves state as { gates, wires } JSON in answer_data.
 */
import { useRef, useEffect, useState, useCallback } from "react";

const GATE_W = 54;
const GATE_H = 36;
const PIN_R = 4;
const CANVAS_W = 700;
const CANVAS_H = 320;

const GATE_TYPES = ["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"];

// Returns input pin positions (relative to gate top-left) and output pin
function getGatePins(gate) {
  const { type, x, y } = gate;
  const isNot = type === "NOT";
  const numInputs = isNot ? 1 : 2;
  const inputs = [];
  for (let i = 0; i < numInputs; i++) {
    const py = isNot
      ? y + GATE_H / 2
      : y + (GATE_H / (numInputs + 1)) * (i + 1);
    inputs.push({ x, y: py, pin: i });
  }
  const bubbleOffset = ["NOT", "NAND", "NOR", "XNOR"].includes(type) ? 8 : 0;
  const output = { x: x + GATE_W + bubbleOffset, y: y + GATE_H / 2, pin: "out" };
  return { inputs, output };
}

// Draw a single gate on canvas context
function drawGate(ctx, gate, highlight) {
  const { type, x, y } = gate;
  ctx.save();
  ctx.strokeStyle = highlight ? "#4ade80" : "#222";
  ctx.fillStyle = highlight ? "#f0fff4" : "#fff";
  ctx.lineWidth = highlight ? 2.5 : 1.8;

  const hasBubble = ["NOT", "NAND", "NOR", "XNOR"].includes(type);
  const bodyW = hasBubble ? GATE_W - 8 : GATE_W;

  if (type === "AND" || type === "NAND") {
    // Flat left, D-curve right
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bodyW * 0.45, y);
    ctx.bezierCurveTo(x + bodyW, y, x + bodyW, y + GATE_H, x + bodyW * 0.45, y + GATE_H);
    ctx.lineTo(x, y + GATE_H);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (type === "OR" || type === "NOR" || type === "XOR" || type === "XNOR") {
    // Curved both sides
    ctx.beginPath();
    ctx.moveTo(x + 6, y);
    ctx.quadraticCurveTo(x + bodyW * 0.45, y, x + bodyW, y + GATE_H / 2);
    ctx.quadraticCurveTo(x + bodyW * 0.45, y + GATE_H, x + 6, y + GATE_H);
    ctx.quadraticCurveTo(x + 16, y + GATE_H / 2, x + 6, y);
    ctx.fill(); ctx.stroke();
    if (type === "XOR" || type === "XNOR") {
      // Extra curved line on input side
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 10, y + GATE_H / 2, x, y + GATE_H);
      ctx.stroke();
    }
  } else if (type === "NOT") {
    // Triangle
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bodyW, y + GATE_H / 2);
    ctx.lineTo(x, y + GATE_H);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  // Bubble (NOT circle at output)
  if (hasBubble) {
    ctx.beginPath();
    ctx.arc(x + bodyW + 4, y + GATE_H / 2, 4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  // Label
  ctx.fillStyle = "#333";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(type, x + (hasBubble ? bodyW - 4 : bodyW) / 2, y + GATE_H / 2);

  // Input pins
  const { inputs, output } = getGatePins(gate);
  ctx.fillStyle = "#555";
  inputs.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, PIN_R - 1, 0, Math.PI * 2);
    ctx.fill();
    // Input wire stub
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x - 10, p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  // Output pin
  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.arc(output.x, output.y, PIN_R - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(output.x, output.y);
  ctx.lineTo(output.x + 10, output.y);
  ctx.stroke();

  ctx.restore();
}

// Draw a Manhattan wire (L-shaped)
function drawWire(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.strokeStyle = color ?? "#2563eb";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  const midX = (x1 + x2) / 2;
  ctx.moveTo(x1, y1);
  ctx.lineTo(midX, y1);
  ctx.lineTo(midX, y2);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Dots at endpoints
  [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = color ?? "#2563eb";
    ctx.fill();
  });
  ctx.restore();
}

let gateIdCounter = 1;

export default function LogicCircuitCanvas({ question, value, onChange }) {
  const canvasRef = useRef(null);
  const config = question?.drawing_config ?? {};
  const inputLabels = config.inputs ?? ["A", "B", "C", "D"];
  const outputLabel = config.output ?? "X";

  // State stored as { gates, wires }
  const [state, setState] = useState(() => {
    if (value && value.gates) return value;
    return { gates: [], wires: [] };
  });
  const [selectedTool, setSelectedTool] = useState(null); // gate type or "eraser"
  const [pendingWire, setPendingWire] = useState(null); // { gateId, pin, x, y }
  const [dragging, setDragging] = useState(null); // { gateId, offsetX, offsetY }
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Persist to answer whenever state changes
  useEffect(() => {
    onChange({ ...state, imageData: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Rendering ──────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { gates, wires } = stateRef.current;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid dots (subtle)
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let gx = 20; gx < CANVAS_W; gx += 20) {
      for (let gy = 20; gy < CANVAS_H; gy += 20) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Input rails (left side)
    const railX = 50;
    inputLabels.forEach((label, i) => {
      const railY = 60 + i * (CANVAS_H - 100) / (inputLabels.length - 1 || 1);
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, railY);
      ctx.lineTo(railX, railY);
      ctx.stroke();
      ctx.fillStyle = "#111";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 8, railY);
      // Pin dot
      ctx.beginPath();
      ctx.arc(railX, railY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
    });

    // Output rail (right side)
    const outRailX = CANVAS_W - 50;
    const outRailY = CANVAS_H / 2;
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(outRailX, outRailY);
    ctx.lineTo(CANVAS_W - 10, outRailY);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(outputLabel, CANVAS_W - 8, outRailY);
    ctx.beginPath();
    ctx.arc(outRailX, outRailY, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();

    // Wires
    const wireColors = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#be185d"];
    wires.forEach((wire, wi) => {
      const fromGate = wire.fromGateId === "input"
        ? null
        : gates.find(g => g.id === wire.fromGateId);
      const toGate = wire.toGateId === "output"
        ? null
        : gates.find(g => g.id === wire.toGateId);

      let x1, y1, x2, y2;

      if (wire.fromGateId === "input") {
        const idx = inputLabels.indexOf(wire.fromPin);
        x1 = 50;
        y1 = 60 + idx * (CANVAS_H - 100) / (inputLabels.length - 1 || 1);
      } else if (fromGate) {
        const pins = getGatePins(fromGate);
        x1 = pins.output.x;
        y1 = pins.output.y;
      } else return;

      if (wire.toGateId === "output") {
        x2 = outRailX;
        y2 = outRailY;
      } else if (toGate) {
        const pins = getGatePins(toGate);
        const inputPin = pins.inputs[wire.toPin] ?? pins.inputs[0];
        x2 = inputPin.x;
        y2 = inputPin.y;
      } else return;

      drawWire(ctx, x1, y1, x2, y2, wireColors[wi % wireColors.length]);
    });

    // Gates
    gates.forEach(gate => {
      drawGate(ctx, gate, pendingWire?.gateId === gate.id || dragging?.gateId === gate.id);
    });

    // Pending wire preview
    if (pendingWire) {
      ctx.save();
      ctx.strokeStyle = "rgba(37,99,235,0.5)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(pendingWire.x, pendingWire.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      ctx.restore();
    }
  }, [inputLabels, outputLabel, pendingWire, dragging, mousePos]);

  useEffect(() => { render(); }, [render, state]);

  // ── Event Helpers ──────────────────────────────────────────────────────────
  function getCanvasPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  }

  function hitTestOutputPin(gates, x, y) {
    for (const gate of gates) {
      const { output } = getGatePins(gate);
      if (Math.hypot(output.x - x, output.y - y) < 10) return { gateId: gate.id, pin: "out", x: output.x, y: output.y };
    }
    // Input rails
    const railX = 50;
    for (let i = 0; i < inputLabels.length; i++) {
      const railY = 60 + i * (CANVAS_H - 100) / (inputLabels.length - 1 || 1);
      if (Math.hypot(railX - x, railY - y) < 10) return { gateId: "input", pin: inputLabels[i], x: railX, y: railY };
    }
    return null;
  }

  function hitTestInputPin(gates, x, y) {
    for (const gate of gates) {
      const { inputs } = getGatePins(gate);
      for (const inp of inputs) {
        if (Math.hypot(inp.x - x, inp.y - y) < 10) return { gateId: gate.id, pin: inp.pin, x: inp.x, y: inp.y };
      }
    }
    // Output rail
    const outRailX = CANVAS_W - 50;
    const outRailY = CANVAS_H / 2;
    if (Math.hypot(outRailX - x, outRailY - y) < 10) return { gateId: "output", pin: "in", x: outRailX, y: outRailY };
    return null;
  }

  function hitTestGate(gates, x, y) {
    return gates.find(g =>
      x >= g.x - 4 && x <= g.x + GATE_W + 12 &&
      y >= g.y - 4 && y <= g.y + GATE_H + 4
    ) ?? null;
  }

  // ── Mouse Handlers ─────────────────────────────────────────────────────────
  function handleMouseDown(e) {
    e.preventDefault();
    const pos = getCanvasPos(e);
    const { gates, wires } = stateRef.current;

    if (selectedTool === "eraser") {
      const hitGate = hitTestGate(gates, pos.x, pos.y);
      if (hitGate) {
        setState(s => ({
          gates: s.gates.filter(g => g.id !== hitGate.id),
          wires: s.wires.filter(w => w.fromGateId !== hitGate.id && w.toGateId !== hitGate.id),
        }));
      }
      return;
    }

    if (pendingWire) {
      // Try to complete a wire to an input pin
      const inputHit = hitTestInputPin(gates, pos.x, pos.y);
      if (inputHit) {
        setState(s => ({
          ...s,
          wires: [...s.wires, {
            fromGateId: pendingWire.gateId,
            fromPin: pendingWire.pin,
            toGateId: inputHit.gateId,
            toPin: inputHit.pin,
          }],
        }));
      }
      setPendingWire(null);
      return;
    }

    // Try starting a wire from an output pin
    const outHit = hitTestOutputPin(gates, pos.x, pos.y);
    if (outHit) {
      setPendingWire(outHit);
      return;
    }

    // Try dragging a gate
    const hitGate = hitTestGate(gates, pos.x, pos.y);
    if (hitGate) {
      setDragging({ gateId: hitGate.id, offsetX: pos.x - hitGate.x, offsetY: pos.y - hitGate.y });
      return;
    }

    // Place new gate
    if (selectedTool && GATE_TYPES.includes(selectedTool)) {
      const newGate = { id: `g${gateIdCounter++}`, type: selectedTool, x: pos.x - GATE_W / 2, y: pos.y - GATE_H / 2 };
      setState(s => ({ ...s, gates: [...s.gates, newGate] }));
    }
  }

  function handleMouseMove(e) {
    e.preventDefault();
    const pos = getCanvasPos(e);
    setMousePos(pos);
    if (dragging) {
      setState(s => ({
        ...s,
        gates: s.gates.map(g =>
          g.id === dragging.gateId
            ? { ...g, x: pos.x - dragging.offsetX, y: pos.y - dragging.offsetY }
            : g
        ),
      }));
    }
  }

  function handleMouseUp(e) {
    e.preventDefault();
    setDragging(null);
  }

  function clearAll() {
    setState({ gates: [], wires: [] });
    gateIdCounter = 1;
  }

  const toolbarBtn = (label, active, onClick) => (
    <button
      key={label}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1.5 items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mr-1">Gates:</span>
        {GATE_TYPES.map(g => toolbarBtn(g, selectedTool === g, () => setSelectedTool(selectedTool === g ? null : g)))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {toolbarBtn("🧹 Eraser", selectedTool === "eraser", () => setSelectedTool(selectedTool === "eraser" ? null : "eraser"))}
        {pendingWire && toolbarBtn("✕ Cancel wire", false, () => setPendingWire(null))}
        <button
          onClick={clearAll}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 transition-all ml-auto"
        >
          Clear All
        </button>
      </div>

      {/* Status */}
      <p className="text-[11px] text-muted-foreground px-1">
        {pendingWire
          ? "Click an input pin or output rail to complete the wire. Click Cancel to abort."
          : selectedTool === "eraser"
            ? "Click a gate to delete it and its wires."
            : selectedTool
              ? `Placing ${selectedTool} gate — click anywhere on the canvas.`
              : "Select a gate to place it, or click an output pin (right side of gate) to start a wire."}
      </p>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          width: "100%",
          height: "auto",
          borderRadius: 10,
          border: "1.5px solid #d1d5db",
          background: "#fff",
          touchAction: "none",
          cursor: selectedTool === "eraser" ? "crosshair" : selectedTool ? "cell" : pendingWire ? "crosshair" : "default",
          display: "block",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />

      <p className="text-[10px] text-muted-foreground/60 text-center">
        Drag gates to reposition · Click output pin → input pin to draw wire · {state.gates.length} gate{state.gates.length !== 1 ? "s" : ""} · {state.wires.length} wire{state.wires.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}