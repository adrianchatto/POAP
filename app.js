const iconOptions = [
  ["search", "Search", "⌕"],
  ["flag", "Flag", "⚑"],
  ["pencil", "Pencil", "✎"],
  ["gear", "Build", "⚙"],
  ["chart", "Chart", "▥"],
  ["check", "Check", "☑"],
  ["rocket", "Launch", "◆"],
  ["shield", "Shield", "◈"],
  ["star", "Star", "★"],
  ["dot", "Dot", "●"],
];

const sampleState = {
  title: "Implementation Plan",
  mode: "weeks",
  columns: 10,
  startDate: "2026-07-20",
  showLegend: true,
  lanes: [
    { name: "Discovery", subtitle: "Sprint 0", start: 1, duration: 1, color: "#5b22d6", icon: "search" },
    { name: "Design", subtitle: "Sprint 1", start: 2, duration: 1, color: "#f81663", icon: "pencil" },
    { name: "Core Build", subtitle: "Sprint 2", start: 3, duration: 2, color: "#ff7900", icon: "gear" },
    { name: "Call Routing & Reporting", subtitle: "Sprint 3", start: 5, duration: 2, color: "#12a84f", icon: "chart" },
    { name: "UAT", subtitle: "Sprint 4", start: 7, duration: 2, color: "#6631cf", icon: "check" },
    { name: "Go Live & Hypercare", subtitle: "Sprint 5", start: 9, duration: 2, color: "#0876f6", icon: "rocket" },
  ],
  milestones: [
    { name: "Kick-off", detail: "Project Mobilisation", position: 1, color: "#5b22d6", icon: "search" },
    { name: "Discovery", detail: "Complete", position: 2, color: "#5b22d6", icon: "flag" },
    { name: "Design", detail: "Sign-off", position: 3, color: "#f81663", icon: "pencil" },
    { name: "Core Build", detail: "Complete", position: 4, color: "#ff7900", icon: "gear" },
    { name: "Call Routing & Reporting", detail: "Tested", position: 6, color: "#12a84f", icon: "chart" },
    { name: "UAT", detail: "Sign-off", position: 8, color: "#6631cf", icon: "check" },
    { name: "Go Live", detail: "Production Cutover", position: 9, color: "#0876f6", icon: "rocket" },
    { name: "Hypercare", detail: "Complete", position: 10, color: "#0876f6", icon: "shield" },
  ],
};

let state = loadState();

const els = {
  title: document.querySelector("#projectTitle"),
  previewTitle: document.querySelector("#previewTitle"),
  columns: document.querySelector("#columnCount"),
  startDate: document.querySelector("#startDate"),
  laneEditor: document.querySelector("#laneEditor"),
  milestoneEditor: document.querySelector("#milestoneEditor"),
  diagram: document.querySelector("#diagram"),
  status: document.querySelector("#statusText"),
  showLegend: document.querySelector("#showLegend"),
};

function loadState() {
  try {
    const saved = localStorage.getItem("plan-lane-builder-state");
    return saved ? normalizeState(JSON.parse(saved)) : structuredClone(sampleState);
  } catch {
    return structuredClone(sampleState);
  }
}

function saveState() {
  localStorage.setItem("plan-lane-builder-state", JSON.stringify(state));
}

function normalizeState(next) {
  return {
    ...structuredClone(sampleState),
    ...next,
    columns: clamp(Number(next.columns) || 10, 1, 52),
    lanes: Array.isArray(next.lanes) ? next.lanes.map(normalizeLane) : [],
    milestones: Array.isArray(next.milestones) ? next.milestones.map(normalizeMilestone) : [],
  };
}

function normalizeLane(lane) {
  return {
    name: String(lane.name || "New phase"),
    subtitle: String(lane.subtitle || ""),
    start: clamp(Number(lane.start) || 1, 1, 52),
    duration: clamp(Number(lane.duration) || 1, 1, 52),
    color: validColor(lane.color) ? lane.color : "#1769f2",
    icon: iconOptions.some(([value]) => value === lane.icon) ? lane.icon : "dot",
  };
}

function normalizeMilestone(milestone) {
  return {
    name: String(milestone.name || "Milestone"),
    detail: String(milestone.detail || ""),
    position: clamp(Number(milestone.position) || 1, 1, 52),
    color: validColor(milestone.color) ? milestone.color : "#1769f2",
    icon: iconOptions.some(([value]) => value === milestone.icon) ? milestone.icon : "star",
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function validColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value));
}

function getIcon(key) {
  return iconOptions.find(([value]) => value === key)?.[2] || "●";
}

function formatDuration(duration) {
  const unit = state.mode === "weeks" ? "week" : "sprint";
  return `${duration} ${unit}${duration === 1 ? "" : "s"}`;
}

function columnLabel(index) {
  if (state.mode === "sprints") return `Sprint ${index}`;
  if (state.mode === "dates") {
    const date = new Date(`${state.startDate || sampleState.startDate}T00:00:00`);
    date.setDate(date.getDate() + (index - 1) * 14);
    return `S${index - 1}\n${formatSprintDate(date)}`;
  }
  return `Week ${index}`;
}

function formatSprintDate(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function render(options = {}) {
  const { rebuildEditors = true } = options;
  state.columns = clamp(Number(state.columns) || 1, 1, 52);
  state.lanes = state.lanes.map((lane) => ({
    ...lane,
    start: clamp(lane.start, 1, state.columns),
    duration: clamp(lane.duration, 1, state.columns - lane.start + 1),
  }));
  state.milestones = state.milestones.map((milestone) => ({
    ...milestone,
    position: clamp(milestone.position, 1, state.columns),
  }));

  saveState();
  renderControls();
  if (rebuildEditors) renderEditors();
  renderDiagram();
}

function renderControls() {
  els.title.value = state.title;
  els.previewTitle.textContent = state.title;
  els.columns.value = state.columns;
  els.startDate.value = state.startDate;
  els.showLegend.checked = state.showLegend;
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
  document.querySelectorAll(".date-only").forEach((el) => {
    el.style.display = state.mode === "dates" ? "grid" : "none";
  });
}

function renderEditors() {
  renderCollectionEditor({
    target: els.laneEditor,
    templateId: "laneTemplate",
    collection: state.lanes,
    onUpdate: (index, key, value) => {
      state.lanes[index][key] = value;
      render({ rebuildEditors: false });
    },
    onRemove: (index) => {
      state.lanes.splice(index, 1);
      render();
    },
  });

  renderCollectionEditor({
    target: els.milestoneEditor,
    templateId: "milestoneTemplate",
    collection: state.milestones,
    onUpdate: (index, key, value) => {
      state.milestones[index][key] = value;
      render({ rebuildEditors: false });
    },
    onRemove: (index) => {
      state.milestones.splice(index, 1);
      render();
    },
  });
}

function renderCollectionEditor({ target, templateId, collection, onUpdate, onRemove }) {
  const template = document.querySelector(`#${templateId}`);
  target.replaceChildren();
  collection.forEach((item, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-title").textContent = item.name;
    node.querySelector(".mini-danger").addEventListener("click", () => onRemove(index));

    node.querySelectorAll("input, select").forEach((input) => {
      const key = input.dataset.key;
      if (input.tagName === "SELECT") {
        input.replaceChildren(
          ...iconOptions.map(([value, label]) => new Option(`${getIcon(value)} ${label}`, value)),
        );
      }
      input.value = item[key];
      input.max = ["start", "duration", "position"].includes(key) ? state.columns : input.max;
      input.addEventListener("input", () => {
        const value = input.type === "number" ? Number(input.value) : input.value;
        onUpdate(index, key, value);
        if (key === "name") node.querySelector(".card-title").textContent = value || "Untitled";
      });
    });

    target.append(node);
  });
}

function renderDiagram() {
  els.diagram.style.setProperty("--columns", state.columns);
  els.diagram.style.setProperty("--rows", state.lanes.length);
  els.diagram.style.setProperty("--legend-count", Math.max(state.milestones.length, 1));

  const chart = document.createElement("div");
  chart.className = "chart";
  chart.style.setProperty("--columns", state.columns);
  chart.style.setProperty("--rows", state.lanes.length);

  chart.append(gridCell("PHASE", "cell header phase-header", 1, 1));
  for (let col = 1; col <= state.columns; col += 1) {
    chart.append(gridCell(columnLabel(col), "cell header", 1, col + 1));
  }

  state.lanes.forEach((lane, rowIndex) => {
    const row = rowIndex + 2;
    chart.append(phaseCell(lane, row));
    for (let col = 1; col <= state.columns; col += 1) {
      chart.append(gridCell("", "cell", row, col + 1));
    }
    chart.append(bar(lane, rowIndex));
  });

  state.milestones.forEach((milestone, index) => {
    const laneRow = Math.min(index, Math.max(state.lanes.length - 1, 0));
    if (milestone.name.toLowerCase().includes("go live")) {
      chart.append(milestoneNode(milestone, Math.max(state.lanes.length - 1, 0)));
    } else if (state.lanes.length <= 3) {
      chart.append(milestoneNode(milestone, laneRow));
    }
  });

  els.diagram.replaceChildren(chart);
  if (state.showLegend && state.milestones.length) {
    els.diagram.append(legend());
  }
}

function gridCell(text, className, row, col) {
  const cell = document.createElement("div");
  cell.className = className;
  cell.style.gridRow = row;
  cell.style.gridColumn = col;
  cell.textContent = text;
  return cell;
}

function phaseCell(lane, row) {
  const cell = gridCell("", "cell phase-cell", row, 1);
  cell.innerHTML = `
    <div class="phase-icon" style="background:${lane.color}">${escapeHtml(getIcon(lane.icon))}</div>
    <div>
      <p class="phase-name">${escapeHtml(lane.name)}</p>
      <p class="phase-subtitle" style="color:${lane.color}">${escapeHtml(lane.subtitle)}</p>
      <p class="phase-duration">${escapeHtml(formatDuration(lane.duration))}</p>
    </div>
  `;
  return cell;
}

function bar(lane, rowIndex) {
  const node = document.createElement("div");
  node.className = "bar";
  node.style.setProperty("--row", rowIndex);
  node.style.setProperty("--start", lane.start);
  node.style.setProperty("--duration", lane.duration);
  node.style.setProperty("--bar-color", lane.color);
  node.textContent = formatDuration(lane.duration);
  return node;
}

function milestoneNode(milestone, rowIndex) {
  const node = document.createElement("div");
  node.className = "milestone";
  node.style.setProperty("--row", rowIndex);
  node.style.setProperty("--position", milestone.position);
  node.style.setProperty("--milestone-color", milestone.color);
  node.innerHTML = `
    <div class="milestone-marker">${escapeHtml(getIcon(milestone.icon))}</div>
    <strong>${escapeHtml(milestone.name)}</strong>
  `;
  return node;
}

function legend() {
  const node = document.createElement("div");
  node.className = "legend";
  node.style.setProperty("--legend-count", state.milestones.length);
  state.milestones.forEach((milestone, index) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `
      <div class="legend-content">
        <div class="legend-icon" style="background:${milestone.color}">${escapeHtml(getIcon(milestone.icon))}</div>
        <div>
          <p class="legend-title">${escapeHtml(milestone.name)}</p>
          <p class="legend-detail">${escapeHtml(milestone.detail)}</p>
        </div>
      </div>
      ${index < state.milestones.length - 1 ? '<div class="chevron">›</div>' : ""}
    `;
    node.append(item);
  });
  return node;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message) {
  els.status.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    els.status.textContent = "";
  }, 2500);
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSvg() {
  download(`${slugify(state.title)}.svg`, buildSvg(), "image/svg+xml");
  setStatus("SVG exported.");
}

function buildSvg() {
  const phaseWidth = 300;
  const cellWidth = 88;
  const headerHeight = 58;
  const rowHeight = 72;
  const chartWidth = phaseWidth + state.columns * cellWidth;
  const chartHeight = headerHeight + state.lanes.length * rowHeight;
  const legendHeight = state.showLegend && state.milestones.length ? 180 : 0;
  const width = chartWidth + 2;
  const height = chartHeight + legendHeight + 32;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<rect x="1" y="1" width="${chartWidth}" height="${chartHeight}" rx="18" fill="#ffffff" stroke="#d7dce2"/>`,
  ];

  for (let col = 0; col <= state.columns; col += 1) {
    const x = phaseWidth + col * cellWidth;
    parts.push(`<line x1="${x}" y1="1" x2="${x}" y2="${chartHeight + 1}" stroke="#e4e7eb"/>`);
  }
  for (let row = 0; row <= state.lanes.length; row += 1) {
    const y = headerHeight + row * rowHeight;
    parts.push(`<line x1="1" y1="${y}" x2="${chartWidth + 1}" y2="${y}" stroke="#e4e7eb"/>`);
  }

  parts.push(svgText("PHASE", phaseWidth / 2, 36, 14, "#16181d", 900, "middle"));
  for (let col = 1; col <= state.columns; col += 1) {
    parts.push(...svgMultilineText(columnLabel(col), phaseWidth + (col - 0.5) * cellWidth, 27, 12, "#16181d", 900, "middle"));
  }

  state.lanes.forEach((lane, index) => {
    const top = headerHeight + index * rowHeight;
    const centerY = top + rowHeight / 2;
    parts.push(`<circle cx="37" cy="${centerY}" r="20" fill="${lane.color}"/>`);
    parts.push(svgText(getIcon(lane.icon), 37, centerY + 7, 20, "#ffffff", 900, "middle"));
    parts.push(...svgWrappedText(lane.name, 74, top + 28, 15, "#16181d", 900, 24));
    parts.push(svgText(lane.subtitle, 74, top + 52, 12, lane.color, 900, "start"));
    parts.push(svgText(formatDuration(lane.duration), 74, top + 67, 12, "#16181d", 400, "start"));

    const barX = phaseWidth + (lane.start - 1) * cellWidth + 5;
    const barY = top + 18;
    const barWidth = lane.duration * cellWidth - 10;
    parts.push(`<rect x="${barX}" y="${barY}" width="${barWidth}" height="36" rx="9" fill="${lane.color}"/>`);
    parts.push(svgText(formatDuration(lane.duration), barX + barWidth / 2, barY + 23, 12, "#ffffff", 900, "middle"));
  });

  const goLive = state.milestones.find((milestone) => milestone.name.toLowerCase().includes("go live"));
  if (goLive && state.lanes.length) {
    const x = phaseWidth + (goLive.position - 0.5) * cellWidth;
    const y = headerHeight + (state.lanes.length - 1) * rowHeight + 70;
    parts.push(svgText(getIcon(goLive.icon), x, y, 48, goLive.color, 900, "middle"));
    parts.push(svgText(goLive.name, x, y + 28, 16, goLive.color, 900, "middle"));
  }

  if (state.showLegend && state.milestones.length) {
    const slot = chartWidth / state.milestones.length;
    const legendTop = chartHeight + 42;
    state.milestones.forEach((milestone, index) => {
      const x = slot * index + slot / 2;
      parts.push(`<circle cx="${x}" cy="${legendTop + 27}" r="27" fill="${milestone.color}"/>`);
      parts.push(svgText(getIcon(milestone.icon), x, legendTop + 36, 25, "#ffffff", 900, "middle"));
      parts.push(...svgWrappedText(milestone.name, x, legendTop + 84, 18, "#16181d", 900, Math.max(8, Math.floor(slot / 10)), "middle"));
      parts.push(...svgWrappedText(milestone.detail, x, legendTop + 116, 16, "#2d333d", 400, Math.max(8, Math.floor(slot / 10)), "middle"));
      if (index < state.milestones.length - 1) {
        parts.push(svgText("›", slot * (index + 1), legendTop + 43, 40, "#8d929a", 300, "middle"));
      }
    });
  }

  parts.push("</svg>");
  return parts.join("\n");
}

function exportPng() {
  const svg = buildSvg();
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth * 2;
    canvas.height = image.naturalHeight * 2;
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus("PNG export failed.");
        return;
      }
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${slugify(state.title)}.png`;
      link.click();
      URL.revokeObjectURL(pngUrl);
      setStatus("PNG exported.");
    }, "image/png");
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus("PNG export failed.");
  };
  image.src = url;
}

function svgText(text, x, y, size, color, weight, anchor) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${escapeHtml(text)}</text>`;
}

function svgMultilineText(text, x, y, size, color, weight, anchor) {
  return String(text)
    .split("\n")
    .map((line, index) => svgText(line, x, y + index * (size + 3), size, color, weight, anchor));
}

function svgWrappedText(text, x, y, size, color, weight, maxChars, anchor = "start") {
  return wrapWords(text, maxChars).map((line, index) =>
    svgText(line, x, y + index * (size + 3), size, color, weight, anchor),
  );
}

function wrapWords(text, maxChars) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function slugify(value) {
  return String(value || "diagram")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    render();
  });
});

els.title.addEventListener("input", () => {
  state.title = els.title.value;
  render();
});

els.columns.addEventListener("input", () => {
  state.columns = Number(els.columns.value);
  render();
});

els.startDate.addEventListener("input", () => {
  state.startDate = els.startDate.value;
  render();
});

els.showLegend.addEventListener("input", () => {
  state.showLegend = els.showLegend.checked;
  render();
});

document.querySelector("#addLane").addEventListener("click", () => {
  state.lanes.push(
    normalizeLane({
      name: "New Phase",
      subtitle: state.mode === "sprints" ? `Sprint ${state.lanes.length + 1}` : "",
      start: Math.min(state.lanes.length + 1, state.columns),
      duration: 1,
      color: "#1769f2",
      icon: "dot",
    }),
  );
  render();
});

document.querySelector("#addMilestone").addEventListener("click", () => {
  state.milestones.push(
    normalizeMilestone({
      name: "Milestone",
      detail: "Complete",
      position: state.columns,
      color: "#1769f2",
      icon: "star",
    }),
  );
  render();
});

document.querySelector("#resetSample").addEventListener("click", () => {
  state = structuredClone(sampleState);
  render();
  setStatus("Sample restored.");
});

document.querySelector("#printDiagram").addEventListener("click", () => window.print());
document.querySelector("#exportSvg").addEventListener("click", exportSvg);
document.querySelector("#exportPng").addEventListener("click", exportPng);

document.querySelector("#copyJson").addEventListener("click", async () => {
  await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  setStatus("JSON copied.");
});

document.querySelector("#importJson").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state = normalizeState(JSON.parse(await file.text()));
    render();
    setStatus("JSON imported.");
  } catch {
    setStatus("That JSON could not be imported.");
  } finally {
    event.target.value = "";
  }
});

render();
