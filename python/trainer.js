#!/usr/bin/env node
/**
 * GODMODE ULTRA - Training Wrapper
 *
 * Node.js wrapper for Python QLoRA trainer
 * Allows BASHER/UI to trigger training runs
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

/**
 * Run ULTRA QLoRA trainer
 * @param {string[]} extraArgs - Additional CLI args for trainer
 * @returns {ChildProcess}
 */
export function runUltraTrainer(extraArgs = []) {
  const pythonExe = process.env.PYTHON_EXE || "python3";

  // Check if trainer module exists
  const trainerPath = path.join(__dirname, "local", "asx_ultra_trainer_qlora.py");
  const hasTrainer = fs.existsSync(trainerPath);

  if (!hasTrainer) {
    console.log("[TRAINER] ⚠ Trainer module not found at:", trainerPath);
    console.log("[TRAINER] This is a wrapper. Create your trainer module at:");
    console.log("[TRAINER]   python/local/asx_ultra_trainer_qlora.py");
    console.log("[TRAINER]");
    console.log("[TRAINER] Example trainer structure:");
    console.log(`
import argparse
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="Qwen/Qwen2-0.5B", help="Base model")
    parser.add_argument("--dataset", default="./python/local_out/atomic_ultra_merged.jsonl")
    parser.add_argument("--output", default="./python/local_out/model_checkpoint")
    args = parser.parse_args()

    # Load model, configure LoRA, train
    print(f"Training {args.model} on {args.dataset}...")

if __name__ == "__main__":
    main()
    `);
    process.exit(1);
  }

  const trainerModule = "python.local.asx_ultra_trainer_qlora";
  const args = ["-m", trainerModule, ...extraArgs];

  console.log("[TRAINER] Starting GODMODE ULTRA training...");
  console.log("[TRAINER] Command:", pythonExe, args.join(" "));
  console.log("[TRAINER] Working directory:", ROOT);
  console.log();

  const proc = spawn(pythonExe, args, {
    cwd: ROOT,
    stdio: "inherit",
  });

  proc.on("error", (err) => {
    console.error("[TRAINER] Failed to start:", err.message);
    console.error("[TRAINER] Make sure Python is installed and accessible");
  });

  proc.on("close", (code) => {
    if (code === 0) {
      console.log();
      console.log("[TRAINER] ✓ Training completed successfully");
    } else {
      console.log();
      console.log(`[TRAINER] ✗ Training exited with code ${code}`);
    }
  });

  return proc;
}

/**
 * Run atomic pipeline (merge datasets)
 */
export function runAtomicPipeline() {
  const pythonExe = process.env.PYTHON_EXE || "python3";
  const script = path.join(__dirname, "mx2lm_atomic_pipeline.py");

  console.log("[PIPELINE] Running atomic dataset merger...");

  const proc = spawn(pythonExe, [script], {
    cwd: ROOT,
    stdio: "inherit",
  });

  proc.on("close", (code) => {
    if (code === 0) {
      console.log("[PIPELINE] ✓ Complete");
    } else {
      console.log(`[PIPELINE] ✗ Failed with code ${code}`);
    }
  });

  return proc;
}

/**
 * Run theory expander
 */
export function runTheoryExpander() {
  const pythonExe = process.env.PYTHON_EXE || "python3";
  const script = path.join(__dirname, "mx2lm_theory_expander.py");

  console.log("[THEORY] Running theory expander...");

  const proc = spawn(pythonExe, [script], {
    cwd: ROOT,
    stdio: "inherit",
  });

  proc.on("close", (code) => {
    if (code === 0) {
      console.log("[THEORY] ✓ Complete");
    } else {
      console.log(`[THEORY] ✗ Failed with code ${code}`);
    }
  });

  return proc;
}

/**
 * Build HTML guide
 */
export function buildGuide() {
  const pythonExe = process.env.PYTHON_EXE || "python3";
  const script = path.join(__dirname, "build_atomic_advanced_guide.py");

  console.log("[GUIDE] Building GODMODE ULTRA guide...");

  const proc = spawn(pythonExe, [script], {
    cwd: ROOT,
    stdio: "inherit",
  });

  proc.on("close", (code) => {
    if (code === 0) {
      console.log("[GUIDE] ✓ Complete");
    } else {
      console.log(`[GUIDE] ✗ Failed with code ${code}`);
    }
  });

  return proc;
}

/**
 * Run full pipeline (merge + theory + guide)
 */
export async function runFullPipeline() {
  console.log("=".repeat(60));
  console.log("GODMODE ULTRA - Full Pipeline");
  console.log("=".repeat(60));
  console.log();

  // Run sequentially
  await new Promise((resolve) => {
    const p1 = runAtomicPipeline();
    p1.on("close", resolve);
  });

  await new Promise((resolve) => {
    const p2 = runTheoryExpander();
    p2.on("close", resolve);
  });

  await new Promise((resolve) => {
    const p3 = buildGuide();
    p3.on("close", resolve);
  });

  console.log();
  console.log("=".repeat(60));
  console.log("✓ Full pipeline complete");
  console.log("=".repeat(60));
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case "train":
      runUltraTrainer(process.argv.slice(3));
      break;

    case "pipeline":
      runAtomicPipeline();
      break;

    case "theory":
      runTheoryExpander();
      break;

    case "guide":
      buildGuide();
      break;

    case "full":
      runFullPipeline();
      break;

    case "help":
    case "--help":
    case "-h":
    default:
      console.log(`
GODMODE ULTRA Training Wrapper

Usage:
  node python/trainer.js <command> [args]

Commands:
  train [args]    Run QLoRA trainer with optional args
  pipeline        Run atomic dataset merger
  theory          Run theory expander
  guide           Build HTML guide
  full            Run full pipeline (merge + theory + guide)
  help            Show this help

Examples:
  node python/trainer.js pipeline
  node python/trainer.js theory
  node python/trainer.js guide
  node python/trainer.js full
  node python/trainer.js train -- --model Qwen/Qwen2-0.5B --epochs 3

Environment:
  PYTHON_EXE      Python executable (default: python3)
      `);
      break;
  }
}
