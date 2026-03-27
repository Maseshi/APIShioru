import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";

const WORKERS = Number(process.env.WORKERS) || os.availableParallelism();

if (cluster.isPrimary) {
  console.log(`🚀 Starting ${WORKERS} worker(s)...`);

  for (let i = 0; i < WORKERS; i++) cluster.fork();

  cluster.on("exit", (worker, code) => {
    console.log(`⚠️ Worker ${worker.process.pid} exited (code: ${code}), restarting...`);
    cluster.fork();
  });
} else {
  await import("./index");
}
