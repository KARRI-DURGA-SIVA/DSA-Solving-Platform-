"use strict";

const API_ROOT = "https://alfa-leetcode-api.onrender.com";
const PAGE_SIZE = 12;
const CACHE_KEY = "codeforge_problem_catalog_v2";
const SOLVED_KEY = "codeforge_solved_v1";
const EXECUTION_API = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

const runtimes = {
  java: {
    id: 91,
    file: "Main.java",
    starter: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Ready to solve!");
    }
}`
  },
  python: {
    id: 109,
    file: "main.py",
    starter: `def solve():
    print("Ready to solve!")

if __name__ == "__main__":
    solve()`
  },
  javascript: {
    id: 102,
    file: "main.js",
    starter: `function solve(input) {
  console.log("Ready to solve!");
}

const input = require("fs").readFileSync(0, "utf8").trim();
solve(input);`
  },
  sql: {
    id: 82,
    file: "solution.sql",
    starter: `-- Create sample tables and write your query below.
CREATE TABLE numbers (value INTEGER);
INSERT INTO numbers VALUES (1), (2), (3);

SELECT * FROM numbers;`
  }
};

const fallbackProblems = [
  ["1", "Two Sum", "two-sum", "Easy", ["Array", "Hash Table"]],
  ["20", "Valid Parentheses", "valid-parentheses", "Easy", ["String", "Stack"]],
  ["21", "Merge Two Sorted Lists", "merge-two-sorted-lists", "Easy", ["Linked List", "Recursion"]],
  ["49", "Group Anagrams", "group-anagrams", "Medium", ["Array", "Hash Table", "String"]],
  ["53", "Maximum Subarray", "maximum-subarray", "Medium", ["Array", "Dynamic Programming"]],
  ["70", "Climbing Stairs", "climbing-stairs", "Easy", ["Dynamic Programming", "Math"]],
  ["98", "Validate Binary Search Tree", "validate-binary-search-tree", "Medium", ["Tree", "DFS"]],
  ["102", "Binary Tree Level Order Traversal", "binary-tree-level-order-traversal", "Medium", ["Tree", "BFS"]],
  ["121", "Best Time to Buy and Sell Stock", "best-time-to-buy-and-sell-stock", "Easy", ["Array", "Dynamic Programming"]],
  ["128", "Longest Consecutive Sequence", "longest-consecutive-sequence", "Medium", ["Array", "Hash Table"]],
  ["141", "Linked List Cycle", "linked-list-cycle", "Easy", ["Linked List", "Two Pointers"]],
  ["200", "Number of Islands", "number-of-islands", "Medium", ["Graph", "BFS", "DFS"]],
  ["206", "Reverse Linked List", "reverse-linked-list", "Easy", ["Linked List", "Recursion"]],
  ["207", "Course Schedule", "course-schedule", "Medium", ["Graph", "Topological Sort"]],
  ["215", "Kth Largest Element in an Array", "kth-largest-element-in-an-array", "Medium", ["Heap", "Sorting"]],
  ["322", "Coin Change", "coin-change", "Medium", ["Dynamic Programming", "BFS"]],
  ["347", "Top K Frequent Elements", "top-k-frequent-elements", "Medium", ["Hash Table", "Heap"]],
  ["704", "Binary Search", "binary-search", "Easy", ["Array", "Binary Search"]],
  ["175", "Combine Two Tables", "combine-two-tables", "Easy", ["Database"]],
  ["176", "Second Highest Salary", "second-highest-salary", "Medium", ["Database"]],
  ["177", "Nth Highest Salary", "nth-highest-salary", "Medium", ["Database"]],
  ["178", "Rank Scores", "rank-scores", "Medium", ["Database"]],
  ["180", "Consecutive Numbers", "consecutive-numbers", "Medium", ["Database"]],
  ["181", "Employees Earning More Than Their Managers", "employees-earning-more-than-their-managers", "Easy", ["Database"]],
  ["184", "Department Highest Salary", "department-highest-salary", "Medium", ["Database"]],
  ["185", "Department Top Three Salaries", "department-top-three-salaries", "Hard", ["Database"]],
  ["262", "Trips and Users", "trips-and-users", "Hard", ["Database"]],
  ["511", "Game Play Analysis I", "game-play-analysis-i", "Easy", ["Database"]]
].map(([id, title, slug, difficulty, topics]) => ({ id, title, slug, difficulty, topics }));

const dbmsRoadmap = [
  ["Database foundations", "Data models, schemas, instances, keys and the role of a DBMS."],
  ["ER modelling", "Entities, relationships, cardinality and converting an ER model to tables."],
  ["Relational algebra", "Selection, projection, joins, set operations and query reasoning."],
  ["Normalization", "Functional dependencies and normal forms from 1NF through BCNF."],
  ["SQL mastery", "DDL, DML, joins, subqueries, CTEs, views and analytical functions."],
  ["Transactions & ACID", "Atomicity, consistency, isolation, durability and transaction states."],
  ["Concurrency control", "Schedules, serializability, locks, timestamps and deadlocks."],
  ["Indexing", "B/B+ trees, hash indexes, clustered indexes and the cost of an index."],
  ["Storage & query processing", "Pages, records, buffers, execution plans and join algorithms."],
  ["Recovery", "Write-ahead logging, checkpoints, undo/redo and crash recovery."],
  ["Distributed databases", "Replication, partitioning, consistency and distributed transactions."],
  ["Interview revision", "Practice schema design, SQL exercises and common DBMS interview questions."]
];

const state = {
  problems: [],
  filtered: [],
  page: 1,
  query: "",
  difficulty: "all",
  topic: "all",
  selected: null,
  currentLanguage: "java",
  running: false,
  solved: new Set(readJson(SOLVED_KEY, []))
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", init);

function init() {
  restoreTheme();
  bindNavigation();
  bindFilters();
  bindDialogs();
  setupReveal();
  renderRoadmap();
  updateSolvedCount();
  loadProblems();
}

function bindNavigation() {
  $("#themeToggle").addEventListener("click", toggleTheme);
  $("#menuButton").addEventListener("click", () => {
    const menu = $("#mobileMenu");
    const opening = menu.hidden;
    menu.hidden = !opening;
    $("#menuButton").setAttribute("aria-expanded", String(opening));
  });
  $$("#mobileMenu a, #mobileMenu button").forEach(item => item.addEventListener("click", () => {
    $("#mobileMenu").hidden = true;
    $("#menuButton").setAttribute("aria-expanded", "false");
  }));
  $$('[data-open-compiler]').forEach(button => button.addEventListener("click", () => openCompiler()));
  $$('[data-track]').forEach(button => button.addEventListener("click", () => {
    const topic = button.dataset.track;
    $("#topicFilter").value = [...$("#topicFilter").options].some(option => option.value === topic) ? topic : "all";
    state.topic = $("#topicFilter").value;
    if (topic === "Database" && state.topic === "all") {
      state.query = "database";
      $("#problemSearch").value = "database";
    }
    applyFilters();
    $("#problems").scrollIntoView({ behavior: "smooth" });
  }));
  $$('[data-open-dbms]').forEach(button => button.addEventListener("click", () => $("#roadmapModal").showModal()));
}

function bindFilters() {
  $("#problemSearch").addEventListener("input", event => {
    state.query = event.target.value.trim().toLowerCase();
    state.page = 1;
    applyFilters();
  });
  $("#difficultyFilter").addEventListener("change", event => {
    state.difficulty = event.target.value;
    state.page = 1;
    applyFilters();
  });
  $("#topicFilter").addEventListener("change", event => {
    state.topic = event.target.value;
    state.page = 1;
    applyFilters();
  });
  $("#resetFilters").addEventListener("click", resetFilters);
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      $("#problemSearch").focus();
    }
  });
}

function bindDialogs() {
  $$('[data-close-modal]').forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  $$('dialog').forEach(dialog => dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) dialog.close();
  }));
  $("#markSolved").addEventListener("click", () => {
    if (!state.selected) return;
    toggleSolved(state.selected.slug, true);
  });
  $("#compilerLanguage").addEventListener("change", event => {
    saveDraft();
    state.currentLanguage = event.target.value;
    loadEditor();
  });
  $("#resetCode").addEventListener("click", () => {
    if (!window.confirm("Reset this editor to the starter code?")) return;
    $("#codeEditor").value = runtimes[state.currentLanguage].starter;
    saveDraft();
    setOutput("Starter code restored.");
  });
  $("#codeEditor").addEventListener("input", debounce(saveDraft, 350));
  $("#codeEditor").addEventListener("keydown", handleEditorKeydown);
  $("#compileCode").addEventListener("click", () => executeCode("compile"));
  $("#runCode").addEventListener("click", () => executeCode("run"));
  $("#submitCode").addEventListener("click", () => executeCode("submit"));
  $$(".console-tab").forEach(tab => tab.addEventListener("click", () => switchConsoleTab(tab.dataset.consoleTab)));
}

async function loadProblems() {
  const cached = readJson(CACHE_KEY, null);
  if (cached?.savedAt && Date.now() - cached.savedAt < 6 * 60 * 60 * 1000 && cached.problems?.length) {
    setProblems(cached.problems);
    setApiState("online", `${cached.problems.length.toLocaleString()} problems · cached`);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const response = await fetchWithTimeout(`${API_ROOT}/problems?limit=4000`, { signal: controller.signal }, timer);
    if (!response.ok) throw new Error(`Problem API returned ${response.status}`);
    const data = await response.json();
    const list = data.problemsetQuestionList || data.questions || data.problems || [];
    const normalized = list.map(normalizeProblem).filter(problem => problem.title && problem.slug);
    if (!normalized.length) throw new Error("Problem API returned an empty catalog");
    setProblems(normalized);
    setStorage(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), problems: normalized }));
    setApiState("online", `${normalized.length.toLocaleString()} live problems`);
  } catch (error) {
    console.warn("Catalog API unavailable:", error);
    if (!state.problems.length) setProblems(fallbackProblems);
    setApiState("fallback", state.problems.length > fallbackProblems.length ? `${state.problems.length.toLocaleString()} cached problems` : "Curated catalog · API offline");
  }
}

function normalizeProblem(problem, index) {
  const rawTopics = problem.topicTags || problem.topics || problem.tags || [];
  const topics = rawTopics.map(topic => typeof topic === "string" ? topic : topic.name).filter(Boolean);
  const rawDifficulty = problem.difficulty || "Medium";
  const difficulty = rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1).toLowerCase();
  return {
    id: String(problem.questionFrontendId || problem.frontendQuestionId || problem.id || index + 1),
    title: problem.title || problem.questionTitle || "Untitled problem",
    slug: problem.titleSlug || problem.slug || "",
    difficulty,
    topics
  };
}

function setProblems(problems) {
  state.problems = problems;
  buildTopicOptions();
  applyFilters();
  $("#heroTotal").textContent = problems.length >= 1000 ? `${problems.length.toLocaleString()}+` : "3,900+";
}

function buildTopicOptions() {
  const select = $("#topicFilter");
  const previous = state.topic;
  const topics = [...new Set(state.problems.flatMap(problem => problem.topics))].sort((a, b) => a.localeCompare(b));
  select.innerHTML = '<option value="all">All topics</option>' + topics.map(topic => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join("");
  if (topics.includes(previous)) select.value = previous;
  else state.topic = "all";
}

function applyFilters() {
  state.filtered = state.problems.filter(problem => {
    const searchable = `${problem.id} ${problem.title} ${problem.topics.join(" ")}`.toLowerCase();
    return (!state.query || searchable.includes(state.query)) &&
      (state.difficulty === "all" || problem.difficulty === state.difficulty) &&
      (state.topic === "all" || problem.topics.includes(state.topic));
  });
  const maxPage = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, maxPage);
  renderProblems();
}

function renderProblems() {
  const body = $("#problemRows");
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = state.filtered.slice(start, start + PAGE_SIZE);
  $("#visibleCount").textContent = state.filtered.length.toLocaleString();
  $("#emptyState").hidden = pageItems.length > 0;
  $(".table-wrap").hidden = pageItems.length === 0;
  body.innerHTML = pageItems.map(problem => {
    const solved = state.solved.has(problem.slug);
    const topicHtml = (problem.topics.length ? problem.topics : ["General"]).slice(0, 3).map(topic => `<span class="row-topic">${escapeHtml(topic)}</span>`).join("");
    return `<tr>
      <td><button class="status-check ${solved ? "solved" : ""}" data-toggle-solved="${escapeHtml(problem.slug)}" aria-label="${solved ? "Mark unsolved" : "Mark solved"}">✓</button></td>
      <td><div class="problem-name"><span class="problem-id">${escapeHtml(problem.id)}</span><button class="problem-title-button" data-problem="${escapeHtml(problem.slug)}">${escapeHtml(problem.title)}</button></div></td>
      <td><span class="difficulty ${problem.difficulty.toLowerCase()}">${escapeHtml(problem.difficulty)}</span></td>
      <td><div class="row-topics">${topicHtml}</div></td>
      <td><button class="solve-button" data-problem="${escapeHtml(problem.slug)}">Solve →</button></td>
    </tr>`;
  }).join("");
  $$('[data-problem]', body).forEach(button => button.addEventListener("click", () => openProblem(button.dataset.problem)));
  $$('[data-toggle-solved]', body).forEach(button => button.addEventListener("click", () => toggleSolved(button.dataset.toggleSolved)));
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  const pagination = $("#pagination");
  if (totalPages <= 1) { pagination.innerHTML = ""; return; }
  const pages = pageWindow(state.page, totalPages);
  pagination.innerHTML = `<button class="page-button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>` +
    pages.map(page => page === "…" ? '<span class="page-button" aria-hidden="true">…</span>' : `<button class="page-button ${page === state.page ? "active" : ""}" data-page="${page}">${page}</button>`).join("") +
    `<button class="page-button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="Next page">›</button>`;
  $$('[data-page]', pagination).forEach(button => button.addEventListener("click", () => {
    state.page = Number(button.dataset.page);
    renderProblems();
    $(".problem-shell").scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current < 5) return [1, 2, 3, 4, 5, "…", total];
  if (current > total - 4) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

async function openProblem(slug) {
  const problem = state.problems.find(item => item.slug === slug);
  if (!problem) return;
  state.selected = problem;
  const language = problem.topics.includes("Database") ? "sql" : state.currentLanguage === "sql" ? "java" : state.currentLanguage;
  $("#workspaceLabel").textContent = "Problem workspace";
  $("#modalTitle").textContent = `${problem.id}. ${problem.title}`;
  $("#modalBody").innerHTML = '<p class="modal-error">Loading the complete problem statement…</p>';
  $("#markSolved").textContent = state.solved.has(slug) ? "Mark as unsolved" : "Mark as solved";
  $("#markSolved").hidden = false;
  prepareEditor(language);
  if (!$("#problemModal").open) $("#problemModal").showModal();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const response = await fetchWithTimeout(`${API_ROOT}/select?titleSlug=${encodeURIComponent(slug)}`, { signal: controller.signal }, timer);
    if (!response.ok) throw new Error(`Detail API returned ${response.status}`);
    const data = await response.json();
    const detail = typeof data.question === "object" ? data.question : data;
    const content = typeof detail === "string" ? detail : (detail.content || detail.questionContent || (typeof detail.question === "string" ? detail.question : ""));
    $("#modalBody").innerHTML = `<div class="problem-meta"><span class="difficulty ${problem.difficulty.toLowerCase()}">${escapeHtml(problem.difficulty)}</span>${problem.topics.slice(0, 4).map(topic => `<span class="row-topic">${escapeHtml(topic)}</span>`).join("")}</div>
      ${content ? sanitizeHtml(content) : fallbackDescription(problem)}
      <p><a class="text-link" style="position:static" href="https://leetcode.com/problems/${encodeURIComponent(slug)}/" target="_blank" rel="noopener noreferrer">View original problem ↗</a></p>`;
  } catch (error) {
    $("#modalBody").innerHTML = `<div class="problem-meta"><span class="difficulty ${problem.difficulty.toLowerCase()}">${escapeHtml(problem.difficulty)}</span>${problem.topics.slice(0, 4).map(topic => `<span class="row-topic">${escapeHtml(topic)}</span>`).join("")}</div>
      ${fallbackDescription(problem)}
      <p class="modal-error">The full statement service is temporarily unavailable. You can still open the original problem or start coding.</p>
      <p><a class="text-link" style="position:static" href="https://leetcode.com/problems/${encodeURIComponent(slug)}/" target="_blank" rel="noopener noreferrer">View original problem ↗</a></p>`;
  }
}

function fallbackDescription(problem) {
  const isSql = problem.topics.includes("Database");
  return `<h3>${isSql ? "SQL challenge" : "Coding challenge"}</h3><p>${isSql ? "Write a query that produces the requested result from the supplied relational tables." : "Design an efficient solution, explain its time and space complexity, and test it against edge cases."}</p>`;
}

function sanitizeHtml(html) {
  const documentFragment = new DOMParser().parseFromString(html, "text/html");
  documentFragment.querySelectorAll("script, style, iframe, object, embed, form, input, button, link, meta").forEach(node => node.remove());
  documentFragment.querySelectorAll("*").forEach(node => {
    [...node.attributes].forEach(attribute => {
      if (attribute.name.startsWith("on") || ["srcdoc", "style"].includes(attribute.name)) node.removeAttribute(attribute.name);
      if (["href", "src"].includes(attribute.name) && !/^(https?:|\/|#)/i.test(attribute.value)) node.removeAttribute(attribute.name);
    });
    if (node.tagName === "A") { node.setAttribute("target", "_blank"); node.setAttribute("rel", "noopener noreferrer"); }
  });
  return documentFragment.body.innerHTML;
}

function toggleSolved(slug, fromModal = false) {
  if (state.solved.has(slug)) state.solved.delete(slug);
  else state.solved.add(slug);
  setStorage(SOLVED_KEY, JSON.stringify([...state.solved]));
  updateSolvedCount();
  renderProblems();
  showToast(state.solved.has(slug) ? "Saved as solved — nicely done." : "Moved back to your practice list.");
  if (fromModal) $("#markSolved").textContent = state.solved.has(slug) ? "Mark as unsolved" : "Mark as solved";
}

function updateSolvedCount() {
  $("#solvedCount").textContent = `${state.solved.size.toLocaleString()} solved on this device`;
}

function resetFilters() {
  state.query = ""; state.difficulty = "all"; state.topic = "all"; state.page = 1;
  $("#problemSearch").value = ""; $("#difficultyFilter").value = "all"; $("#topicFilter").value = "all";
  applyFilters();
}

function openCompiler(language = "java") {
  state.selected = null;
  $("#workspaceLabel").textContent = "Online playground";
  $("#modalTitle").textContent = "Code compiler";
  $("#markSolved").hidden = true;
  $("#modalBody").innerHTML = `<h3>Fast coding playground</h3><p>Choose a language, write your program, add optional custom input, and run it. Your draft is saved automatically on this device.</p><p class="modal-error">Code runs in an isolated Judge0 environment. Avoid placing passwords, API keys, or private data in the editor.</p>`;
  prepareEditor(runtimes[language] ? language : "java");
  if (!$("#problemModal").open) $("#problemModal").showModal();
}

function prepareEditor(language) {
  state.currentLanguage = language;
  $("#compilerLanguage").value = language;
  loadEditor();
  switchConsoleTab("output");
  $("#runMeta").textContent = "";
  setOutput("Press Run to execute your code.");
}

function loadEditor() {
  const runtime = runtimes[state.currentLanguage];
  $("#editorFileName").textContent = runtime.file;
  $("#codeEditor").value = getStorage(draftKey()) || runtime.starter;
}

function draftKey() {
  return `codeforge_draft_${state.selected?.slug || "playground"}_${state.currentLanguage}`;
}

function saveDraft() {
  setStorage(draftKey(), $("#codeEditor").value);
}

function handleEditorKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    executeCode("run");
    return;
  }
  if (event.key === "Tab") {
    event.preventDefault();
    const editor = event.currentTarget;
    const start = editor.selectionStart;
    editor.setRangeText("    ", start, editor.selectionEnd, "end");
    saveDraft();
  }
}

function switchConsoleTab(tabName) {
  $$(".console-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.consoleTab === tabName));
  $("#codeOutput").hidden = tabName !== "output";
  $("#codeInput").hidden = tabName !== "input";
}

async function executeCode(action) {
  if (state.running) return;
  const sourceCode = $("#codeEditor").value;
  if (!sourceCode.trim()) { setOutput("Write some code before running it.", "error"); return; }
  state.running = true;
  saveDraft();
  switchConsoleTab("output");
  setExecutionButtons(true);
  setOutput(action === "compile" ? "Compiling…" : action === "submit" ? "Running final check…" : "Running…", "running");
  $("#runMeta").textContent = "Please wait";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40000);
    const response = await fetchWithTimeout(EXECUTION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: runtimes[state.currentLanguage].id,
        source_code: sourceCode,
        stdin: $("#codeInput").value
      }),
      signal: controller.signal
    }, timer);
    if (!response.ok) throw new Error(`Compiler returned HTTP ${response.status}`);
    const result = await response.json();
    const failed = Boolean(result.compile_output || result.stderr || (result.status?.id && result.status.id !== 3));
    const text = result.compile_output || result.stderr || result.stdout || result.message || (action === "compile" ? "Compilation successful. No output." : "Program finished with no output.");
    const heading = failed ? `${result.status?.description || "Execution failed"}\n\n` : action === "compile" ? "Build successful\n\n" : "Execution successful\n\n";
    const submitNote = action === "submit" && !failed ? "\n\nSaved locally and marked solved. Hidden LeetCode tests are not run by this compiler." : "";
    setOutput(heading + text.trimEnd() + submitNote, failed ? "error" : "success");
    $("#runMeta").textContent = [result.time ? `${result.time}s` : "", result.memory ? `${Math.round(result.memory / 1024)} MB` : ""].filter(Boolean).join(" · ");
    if (action === "submit" && !failed) {
      if (state.selected && !state.solved.has(state.selected.slug)) toggleSolved(state.selected.slug, true);
      showToast(state.selected ? "Solution saved and problem marked solved." : "Code saved successfully.");
    }
  } catch (error) {
    const message = error.name === "AbortError" ? "The compiler timed out. Please try again." : "The compiler service could not be reached. Check your connection and try again.";
    setOutput(`${message}\n\n${error.message}`, "error");
    $("#runMeta").textContent = "Unavailable";
  } finally {
    state.running = false;
    setExecutionButtons(false);
  }
}

function setOutput(message, stateName = "") {
  const output = $("#codeOutput");
  output.textContent = message;
  output.className = `code-output ${stateName}`.trim();
}

function setExecutionButtons(disabled) {
  ["#compileCode", "#runCode", "#submitCode"].forEach(selector => {
    const button = $(selector);
    if (button) button.disabled = disabled;
  });
}

function renderRoadmap() {
  $("#roadmapList").innerHTML = dbmsRoadmap.map(([title, description]) => `<article class="roadmap-step"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div></article>`).join("");
}

function setApiState(type, message) {
  const element = $("#apiState");
  element.className = `api-state ${type}`;
  element.lastElementChild.textContent = message;
}

function restoreTheme() {
  const stored = getStorage("codeforge_theme");
  const light = stored ? stored === "light" : false;
  document.body.classList.toggle("light", light);
  updateThemeIcon();
}

function toggleTheme() {
  document.body.classList.toggle("light");
  setStorage("codeforge_theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeIcon();
}

function updateThemeIcon() {
  const light = document.body.classList.contains("light");
  $(".theme-icon").textContent = light ? "☀" : "☾";
  $("#themeToggle").setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(element => element.classList.add("visible")); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  $$(".reveal").forEach(element => observer.observe(element));
}

let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function readJson(key, fallback) {
  try { return JSON.parse(getStorage(key)) ?? fallback; } catch (_) { return fallback; }
}

async function fetchWithTimeout(url, options, timer) {
  try {
    return await fetch(url, options);
  } finally {
    clearTimeout(timer);
  }
}

function getStorage(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function setStorage(key, value) {
  try { localStorage.setItem(key, value); } catch (_) { /* Storage may be disabled or full. */ }
}

function debounce(callback, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => callback(...args), delay); };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}
