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

const raciOptions = [
  ["", "-"],
  ["R", "R - Responsible"],
  ["A", "A - Accountable"],
  ["C", "C - Consulted"],
  ["I", "I - Informed"],
];

const sampleRaciState = {
  title: "Implementation RACI",
  opportunity: "",
  roles: [
    { id: "role_client_sponsor", name: "Client Sponsor" },
    { id: "role_project_manager", name: "Project Manager" },
    { id: "role_solution_architect", name: "Solution Architect" },
    { id: "role_delivery_team", name: "Delivery Team" },
  ],
  activities: [
    {
      id: "activity_discovery",
      name: "Discovery workshops",
      detail: "Confirm scope, stakeholders, goals, and success measures",
      assignments: {
        role_client_sponsor: "A",
        role_project_manager: "R",
        role_solution_architect: "R",
        role_delivery_team: "C",
      },
    },
    {
      id: "activity_solution_design",
      name: "Solution design",
      detail: "Define target design, integrations, data, and reporting needs",
      assignments: {
        role_client_sponsor: "C",
        role_project_manager: "A",
        role_solution_architect: "R",
        role_delivery_team: "C",
      },
    },
    {
      id: "activity_build",
      name: "Build and configuration",
      detail: "Configure solution components and prepare test-ready release",
      assignments: {
        role_client_sponsor: "I",
        role_project_manager: "A",
        role_solution_architect: "C",
        role_delivery_team: "R",
      },
    },
    {
      id: "activity_uat",
      name: "UAT and sign-off",
      detail: "Run acceptance testing, resolve defects, and capture approval",
      assignments: {
        role_client_sponsor: "A",
        role_project_manager: "R",
        role_solution_architect: "C",
        role_delivery_team: "R",
      },
    },
    {
      id: "activity_go_live",
      name: "Go live",
      detail: "Coordinate release, cutover, and hypercare transition",
      assignments: {
        role_client_sponsor: "A",
        role_project_manager: "R",
        role_solution_architect: "R",
        role_delivery_team: "R",
      },
    },
  ],
};

let activeTool = localStorage.getItem("delivery-diagram-active-tool") || "plan";
let state = loadState();
let raciState = loadRaciState();

const els = {
  planTab: document.querySelector("#planTab"),
  raciTab: document.querySelector("#raciTab"),
  planEditor: document.querySelector("#planEditor"),
  raciEditor: document.querySelector("#raciEditor"),
  title: document.querySelector("#projectTitle"),
  raciTitle: document.querySelector("#raciTitle"),
  raciOpportunity: document.querySelector("#raciOpportunity"),
  previewTitle: document.querySelector("#previewTitle"),
  columns: document.querySelector("#columnCount"),
  startDate: document.querySelector("#startDate"),
  laneEditor: document.querySelector("#laneEditor"),
  milestoneEditor: document.querySelector("#milestoneEditor"),
  raciRoleEditor: document.querySelector("#raciRoleEditor"),
  raciActivityEditor: document.querySelector("#raciActivityEditor"),
  diagram: document.querySelector("#diagram"),
  status: document.querySelector("#statusText"),
  raciStatus: document.querySelector("#raciStatusText"),
  showLegend: document.querySelector("#showLegend"),
  raciKey: document.querySelector("#raciKey"),
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

function loadRaciState() {
  try {
    const saved = localStorage.getItem("raci-builder-state");
    return saved ? normalizeRaciState(JSON.parse(saved)) : structuredClone(sampleRaciState);
  } catch {
    return structuredClone(sampleRaciState);
  }
}

function saveRaciState() {
  localStorage.setItem("raci-builder-state", JSON.stringify(raciState));
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

function normalizeRaciState(next) {
  const roles = Array.isArray(next.roles) ? next.roles.map(normalizeRaciRole) : [];
  const activities = Array.isArray(next.activities)
    ? next.activities.map((activity) => normalizeRaciActivity(activity, roles))
    : [];
  return {
    ...structuredClone(sampleRaciState),
    ...next,
    title: String(next.title || "RACI Matrix"),
    opportunity: String(next.opportunity || ""),
    roles,
    activities,
  };
}

function normalizeRaciRole(role) {
  return {
    id: String(role.id || uid("role")),
    name: String(role.name || "New role"),
  };
}

function normalizeRaciActivity(activity, roles) {
  const assignments = {};
  roles.forEach((role) => {
    assignments[role.id] = normalizeRaciValue(activity.assignments?.[role.id]);
  });
  return {
    id: String(activity.id || uid("activity")),
    name: String(activity.name || "New activity"),
    detail: String(activity.detail || ""),
    assignments,
  };
}

function normalizeRaciValue(value) {
  return ["R", "A", "C", "I"].includes(value) ? value : "";
}

function uid(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}_${window.crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

function renderRaci(options = {}) {
  const { rebuildEditors = true } = options;
  raciState = normalizeRaciState(raciState);
  saveRaciState();
  renderRaciControls();
  if (rebuildEditors) renderRaciEditors();
  renderRaciDiagram();
}

function switchTool(tool) {
  activeTool = tool === "raci" ? "raci" : "plan";
  localStorage.setItem("delivery-diagram-active-tool", activeTool);
  els.planTab.classList.toggle("active", activeTool === "plan");
  els.raciTab.classList.toggle("active", activeTool === "raci");
  els.planEditor.classList.toggle("hidden", activeTool !== "plan");
  els.raciEditor.classList.toggle("hidden", activeTool !== "raci");
  els.showLegend.closest(".toggle").classList.toggle("hidden", activeTool !== "plan");
  els.raciKey.classList.toggle("hidden", activeTool !== "raci");
  if (activeTool === "plan") render();
  else renderRaci();
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

function renderRaciControls() {
  els.raciTitle.value = raciState.title;
  els.raciOpportunity.value = raciState.opportunity;
  els.previewTitle.textContent = raciState.title;
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

function renderRaciEditors() {
  renderRaciRoleEditor();
  renderRaciActivityEditor();
}

function renderRaciRoleEditor() {
  const template = document.querySelector("#raciRoleTemplate");
  els.raciRoleEditor.replaceChildren();
  raciState.roles.forEach((role, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-title").textContent = role.name;
    node.querySelector(".mini-danger").addEventListener("click", () => {
      const [removed] = raciState.roles.splice(index, 1);
      raciState.activities.forEach((activity) => delete activity.assignments[removed.id]);
      renderRaci();
    });
    const input = node.querySelector("input");
    input.value = role.name;
    input.addEventListener("input", () => {
      raciState.roles[index].name = input.value;
      node.querySelector(".card-title").textContent = input.value || "Untitled";
      renderRaci({ rebuildEditors: false });
    });
    els.raciRoleEditor.append(node);
  });
}

function renderRaciActivityEditor() {
  const template = document.querySelector("#raciActivityTemplate");
  els.raciActivityEditor.replaceChildren();
  raciState.activities.forEach((activity, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".card-title").textContent = activity.name;
    node.querySelector(".mini-danger").addEventListener("click", () => {
      raciState.activities.splice(index, 1);
      renderRaci();
    });

    node.querySelectorAll("input").forEach((input) => {
      const key = input.dataset.key;
      input.value = activity[key];
      input.addEventListener("input", () => {
        raciState.activities[index][key] = input.value;
        if (key === "name") node.querySelector(".card-title").textContent = input.value || "Untitled";
        renderRaci({ rebuildEditors: false });
      });
    });

    const grid = node.querySelector(".raci-assignment-grid");
    raciState.roles.forEach((role) => {
      const label = document.createElement("label");
      label.className = "field";
      const text = document.createElement("span");
      text.textContent = role.name;
      const select = document.createElement("select");
      raciOptions.forEach(([value, labelText]) => select.append(new Option(labelText, value)));
      select.value = activity.assignments[role.id] || "";
      select.addEventListener("input", () => {
        raciState.activities[index].assignments[role.id] = select.value;
        renderRaci({ rebuildEditors: false });
      });
      label.append(text, select);
      grid.append(label);
    });

    els.raciActivityEditor.append(node);
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

function renderRaciDiagram() {
  const wrapper = document.createElement("div");
  wrapper.className = "raci-table-wrap";
  wrapper.innerHTML = `
    <div class="raci-title-block">
      <div>
        <h3>${escapeHtml(raciState.title)}</h3>
        ${raciState.opportunity ? `<p>${escapeHtml(raciState.opportunity)}</p>` : ""}
      </div>
    </div>
  `;
  const table = document.createElement("table");
  table.className = "raci-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const activityHead = document.createElement("th");
  activityHead.textContent = "Activity";
  headRow.append(activityHead);
  raciState.roles.forEach((role) => {
    const th = document.createElement("th");
    th.textContent = role.name;
    headRow.append(th);
  });
  thead.append(headRow);
  table.append(thead);

  const tbody = document.createElement("tbody");
  raciState.activities.forEach((activity) => {
    const row = document.createElement("tr");
    const activityCell = document.createElement("td");
    activityCell.className = "raci-activity";
    activityCell.innerHTML = `<strong>${escapeHtml(activity.name)}</strong>${activity.detail ? `<span>${escapeHtml(activity.detail)}</span>` : ""}`;
    row.append(activityCell);
    raciState.roles.forEach((role) => {
      const td = document.createElement("td");
      const value = activity.assignments[role.id] || "";
      td.innerHTML = value ? `<span class="raci-chip ${value.toLowerCase()}">${value}</span>` : '<span class="raci-empty">-</span>';
      row.append(td);
    });
    tbody.append(row);
  });
  table.append(tbody);
  wrapper.append(table);
  els.diagram.replaceChildren(wrapper);
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
  const target = activeTool === "raci" ? els.raciStatus : els.status;
  target.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    target.textContent = "";
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
  download(`${slugify(activeTitle())}.svg`, buildActiveSvg(), "image/svg+xml");
  setStatus("SVG exported.");
}

function buildActiveSvg() {
  return activeTool === "raci" ? buildRaciSvg() : buildSvg();
}

function activeTitle() {
  return activeTool === "raci" ? raciState.title : state.title;
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

function buildRaciSvg() {
  const activityWidth = 330;
  const roleWidth = 122;
  const headerHeight = 62;
  const rowHeight = 78;
  const titleHeight = 82;
  const width = activityWidth + raciState.roles.length * roleWidth + 2;
  const tableHeight = headerHeight + raciState.activities.length * rowHeight;
  const height = titleHeight + tableHeight + 44;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    svgText(raciState.title, 1, 34, 26, "#16181d", 900, "start"),
  ];
  if (raciState.opportunity) {
    parts.push(svgText(raciState.opportunity, 1, 58, 13, "#616977", 800, "start"));
  }

  const tableTop = titleHeight;
  parts.push(`<rect x="1" y="${tableTop}" width="${width - 2}" height="${tableHeight}" rx="18" fill="#ffffff" stroke="#d7dce2"/>`);
  parts.push(`<rect x="1" y="${tableTop}" width="${width - 2}" height="${headerHeight}" rx="18" fill="#fbfcfe"/>`);
  parts.push(svgText("Activity", 18, tableTop + 38, 12, "#16181d", 900, "start"));
  raciState.roles.forEach((role, index) => {
    const x = activityWidth + index * roleWidth;
    parts.push(svgText(role.name, x + roleWidth / 2, tableTop + 38, 12, "#16181d", 900, "middle"));
  });

  for (let col = 0; col <= raciState.roles.length; col += 1) {
    const x = activityWidth + col * roleWidth;
    parts.push(`<line x1="${x}" y1="${tableTop}" x2="${x}" y2="${tableTop + tableHeight}" stroke="#e4e7eb"/>`);
  }
  for (let row = 0; row <= raciState.activities.length; row += 1) {
    const y = tableTop + headerHeight + row * rowHeight;
    parts.push(`<line x1="1" y1="${y}" x2="${width - 1}" y2="${y}" stroke="#e4e7eb"/>`);
  }

  raciState.activities.forEach((activity, rowIndex) => {
    const top = tableTop + headerHeight + rowIndex * rowHeight;
    parts.push(...svgWrappedText(activity.name, 18, top + 28, 15, "#16181d", 900, 34));
    if (activity.detail) {
      parts.push(...svgWrappedText(activity.detail, 18, top + 54, 12, "#616977", 400, 44));
    }
    raciState.roles.forEach((role, colIndex) => {
      const value = activity.assignments[role.id] || "";
      const centerX = activityWidth + colIndex * roleWidth + roleWidth / 2;
      const centerY = top + rowHeight / 2;
      if (value) {
        parts.push(`<circle cx="${centerX}" cy="${centerY}" r="18" fill="${raciColor(value)}"/>`);
        parts.push(svgText(value, centerX, centerY + 6, 16, "#ffffff", 900, "middle"));
      } else {
        parts.push(svgText("-", centerX, centerY + 5, 16, "#b4bbc5", 900, "middle"));
      }
    });
  });

  parts.push(svgText("R Responsible   A Accountable   C Consulted   I Informed", 1, height - 10, 12, "#616977", 800, "start"));
  parts.push("</svg>");
  return parts.join("\n");
}

function raciColor(value) {
  return {
    R: "#1769f2",
    A: "#f81663",
    C: "#12a84f",
    I: "#ff7900",
  }[value] || "#b4bbc5";
}

function exportPng() {
  const svg = buildActiveSvg();
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
      link.download = `${slugify(activeTitle())}.png`;
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

document.querySelectorAll(".app-tabs button").forEach((button) => {
  button.addEventListener("click", () => switchTool(button.dataset.tool));
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

els.raciTitle.addEventListener("input", () => {
  raciState.title = els.raciTitle.value;
  renderRaci({ rebuildEditors: false });
});

els.raciOpportunity.addEventListener("input", () => {
  raciState.opportunity = els.raciOpportunity.value;
  renderRaci({ rebuildEditors: false });
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

document.querySelector("#addRaciRole").addEventListener("click", () => {
  const role = { id: uid("role"), name: "New Role" };
  raciState.roles.push(role);
  raciState.activities.forEach((activity) => {
    activity.assignments[role.id] = "";
  });
  renderRaci();
});

document.querySelector("#addRaciActivity").addEventListener("click", () => {
  const assignments = {};
  raciState.roles.forEach((role) => {
    assignments[role.id] = "";
  });
  raciState.activities.push({
    id: uid("activity"),
    name: "New Activity",
    detail: "",
    assignments,
  });
  renderRaci();
});

document.querySelector("#resetSample").addEventListener("click", () => {
  if (activeTool === "raci") {
    raciState = structuredClone(sampleRaciState);
    renderRaci();
  } else {
    state = structuredClone(sampleState);
    render();
  }
  setStatus("Sample restored.");
});

document.querySelector("#printDiagram").addEventListener("click", () => window.print());
document.querySelector("#exportSvg").addEventListener("click", exportSvg);
document.querySelector("#exportPng").addEventListener("click", exportPng);

document.querySelector("#copyJson").addEventListener("click", async () => {
  await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  setStatus("JSON copied.");
});

document.querySelector("#copyRaciJson").addEventListener("click", async () => {
  await navigator.clipboard.writeText(JSON.stringify(raciState, null, 2));
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

document.querySelector("#importRaciJson").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    raciState = normalizeRaciState(JSON.parse(await file.text()));
    renderRaci();
    setStatus("JSON imported.");
  } catch {
    setStatus("That JSON could not be imported.");
  } finally {
    event.target.value = "";
  }
});

switchTool(activeTool);
