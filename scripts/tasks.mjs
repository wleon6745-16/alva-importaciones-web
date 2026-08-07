#!/usr/bin/env node
// Administrador simple de tasks/seo-tasks.json.
// Uso:
//   node scripts/tasks.mjs status
//   node scripts/tasks.mjs next
//   node scripts/tasks.mjs start <ID>
//   node scripts/tasks.mjs complete <ID>
//   node scripts/tasks.mjs fail <ID> [motivo...]
//   node scripts/tasks.mjs validate [ID]
//
// Sin dependencias externas: solo Node built-ins. Ver docs/seo-work/MASTER_PLAN.md.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TASKS_PATH = path.join(ROOT, "tasks", "seo-tasks.json");
const CURRENT_STATE_PATH = path.join(ROOT, "docs", "seo-work", "CURRENT_STATE.md");
const EVIDENCE_DIR = path.join(ROOT, "tasks", "evidence");
const FAILED_DIR = path.join(ROOT, "tasks", "failed");
const COMPLETED_DIR = path.join(ROOT, "tasks", "completed");

function loadTasks() {
  const raw = readFileSync(TASKS_PATH, "utf-8");
  return JSON.parse(raw);
}

function saveTasks(data) {
  writeFileSync(TASKS_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function findTask(data, id) {
  const task = data.tasks.find((t) => t.id === id);
  if (!task) {
    console.error(`No existe la tarea "${id}" en tasks/seo-tasks.json`);
    process.exit(1);
  }
  return task;
}

function dependenciesMet(data, task) {
  return task.dependencies.every((depId) => {
    const dep = data.tasks.find((t) => t.id === depId);
    return dep && dep.status === "completed";
  });
}

function nowIso() {
  return new Date().toISOString();
}

function updateCurrentStateSummary(data) {
  if (!existsSync(CURRENT_STATE_PATH)) return;
  const content = readFileSync(CURRENT_STATE_PATH, "utf-8");
  const current = data.tasks.find((t) => t.id === data.currentTask);
  const block = [
    "<!-- AUTO:SUMMARY:START -->",
    `- Fase actual: ${data.currentPhase}`,
    `- Tarea actual: ${data.currentTask}`,
    `- Estado de la tarea actual: ${current ? current.status : "desconocido"}`,
    `- Última actualización: ${nowIso()}`,
    "<!-- AUTO:SUMMARY:END -->",
  ].join("\n");

  const re = /<!-- AUTO:SUMMARY:START -->[\s\S]*?<!-- AUTO:SUMMARY:END -->/;
  const updated = re.test(content) ? content.replace(re, block) : content + "\n\n" + block + "\n";
  writeFileSync(CURRENT_STATE_PATH, updated, "utf-8");
}

function printStatus(data) {
  console.log(`Proyecto: ${data.project}`);
  console.log(`Fase actual: ${data.currentPhase}`);
  console.log(`Tarea actual: ${data.currentTask}`);
  console.log("");
  console.log("ID        Fase  Estado        Prioridad  Título");
  console.log("--------  ----  ------------  ---------  -----");
  for (const t of data.tasks) {
    console.log(
      `${t.id.padEnd(8)}  ${String(t.phase).padEnd(4)}  ${t.status.padEnd(12)}  ${t.priority.padEnd(9)}  ${t.title}`,
    );
  }
}

function nextTask(data) {
  const pending = data.tasks.filter((t) => t.status === "pending" || t.status === "failed");
  const ready = pending.find((t) => dependenciesMet(data, t));
  if (!ready) {
    if (pending.length === 0) {
      console.log("No quedan tareas pendientes. Revisa manual_review si aplica.");
    } else {
      console.log("Hay tareas pendientes pero ninguna tiene sus dependencias cumplidas todavía:");
      for (const t of pending) {
        const missing = t.dependencies.filter((d) => {
          const dep = data.tasks.find((x) => x.id === d);
          return !dep || dep.status !== "completed";
        });
        console.log(`  - ${t.id}: falta(n) ${missing.join(", ")}`);
      }
    }
    return null;
  }
  console.log(`Siguiente tarea lista: ${ready.id} — ${ready.title} (fase ${ready.phase})`);
  return ready;
}

function cmdStart(data, id) {
  const task = findTask(data, id);
  if (task.status === "in_progress") {
    console.log(`${id} ya está in_progress.`);
    return;
  }
  if (task.status === "completed") {
    console.error(`${id} ya está completed. Usa una nueva tarea si hay que rehacer algo.`);
    process.exit(1);
  }
  if (!dependenciesMet(data, task)) {
    const missing = task.dependencies.filter((d) => {
      const dep = data.tasks.find((x) => x.id === d);
      return !dep || dep.status !== "completed";
    });
    console.error(`${id} está bloqueada. Dependencias sin completar: ${missing.join(", ")}`);
    task.status = "blocked";
    saveTasks(data);
    process.exit(1);
  }
  task.status = "in_progress";
  task.startedAt = nowIso();
  data.currentTask = id;
  data.currentPhase = task.phase;
  saveTasks(data);
  updateCurrentStateSummary(data);
  console.log(`${id} marcada in_progress. Fase ${task.phase}.`);
}

function runValidation(task) {
  const results = [];
  for (const cmd of task.validationCommands || []) {
    console.log(`> ${cmd}`);
    try {
      const output = execSync(cmd, { cwd: ROOT, stdio: "pipe" }).toString();
      results.push({ cmd, ok: true, output });
      console.log(output);
    } catch (err) {
      const output = (err.stdout?.toString() || "") + (err.stderr?.toString() || err.message);
      results.push({ cmd, ok: false, output });
      console.error(output);
    }
  }
  return results;
}

function cmdValidate(data, id) {
  const targetId = id || data.currentTask;
  const task = findTask(data, targetId);
  const results = runValidation(task);
  const allOk = results.every((r) => r.ok);
  console.log(allOk ? `\nValidación OK para ${targetId}.` : `\nValidación FALLÓ para ${targetId}.`);
  if (!allOk) process.exit(1);
}

function cmdComplete(data, id) {
  const task = findTask(data, id);
  if (task.status !== "in_progress") {
    console.error(`${id} no está in_progress (está "${task.status}"). Usa task:start primero.`);
    process.exit(1);
  }
  const results = runValidation(task);
  const allOk = results.every((r) => r.ok);

  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const evidencePath = path.join(EVIDENCE_DIR, `${id}.log`);
  const evidenceContent = results
    .map((r) => `$ ${r.cmd}\n${r.ok ? "OK" : "FAIL"}\n${r.output}\n`)
    .join("\n---\n");
  writeFileSync(evidencePath, evidenceContent, "utf-8");

  if (!allOk) {
    console.error(
      `Las validaciones de ${id} fallaron. No se marca como completed. Evidencia en ${path.relative(ROOT, evidencePath)}.`,
    );
    process.exit(1);
  }

  task.status = "completed";
  task.completedAt = nowIso();
  saveTasks(data);
  updateCurrentStateSummary(data);

  mkdirSync(COMPLETED_DIR, { recursive: true });
  writeFileSync(
    path.join(COMPLETED_DIR, `${id}.md`),
    `# ${id} — ${task.title}\n\nCompletada: ${task.completedAt}\n\nCriterios de aceptación:\n${task.acceptanceCriteria.map((c) => `- [x] ${c}`).join("\n")}\n`,
    "utf-8",
  );

  console.log(`${id} marcada completed. Evidencia en ${path.relative(ROOT, evidencePath)}.`);

  const next = nextTask(data);
  if (next) {
    console.log(`Sugerencia: npm run task:start -- ${next.id}`);
  }
}

function cmdFail(data, id, reasonParts) {
  const task = findTask(data, id);
  const reason = reasonParts.join(" ") || "(sin motivo registrado — edítalo a mano en tasks/failed/)";
  task.status = "failed";
  task.failedAt = nowIso();
  task.failReason = reason;
  saveTasks(data);
  updateCurrentStateSummary(data);

  mkdirSync(FAILED_DIR, { recursive: true });
  writeFileSync(
    path.join(FAILED_DIR, `${id}.md`),
    `# ${id} — ${task.title}\n\nFalló: ${task.failedAt}\n\nMotivo:\n${reason}\n`,
    "utf-8",
  );

  console.log(`${id} marcada failed. Detalle en tasks/failed/${id}.md`);
  console.log("Recuerda documentar en docs/seo-work/CURRENT_STATE.md y NEXT_SESSION.md qué falta.");
}

function main() {
  const [, , cmd, ...rest] = process.argv;
  const data = loadTasks();

  switch (cmd) {
    case "status":
      printStatus(data);
      break;
    case "next":
      nextTask(data);
      break;
    case "start":
      if (!rest[0]) {
        console.error("Uso: npm run task:start -- <ID>");
        process.exit(1);
      }
      cmdStart(data, rest[0]);
      break;
    case "complete":
      if (!rest[0]) {
        console.error("Uso: npm run task:complete -- <ID>");
        process.exit(1);
      }
      cmdComplete(data, rest[0]);
      break;
    case "fail":
      if (!rest[0]) {
        console.error("Uso: npm run task:fail -- <ID> [motivo...]");
        process.exit(1);
      }
      cmdFail(data, rest[0], rest.slice(1));
      break;
    case "validate":
      cmdValidate(data, rest[0]);
      break;
    default:
      console.error("Comando desconocido. Usa: status | next | start | complete | fail | validate");
      process.exit(1);
  }
}

main();
