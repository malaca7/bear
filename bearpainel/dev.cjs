const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Delete conflicting middleware.ts before Next.js starts
const middlewarePath = path.join(__dirname, "src", "middleware.ts");
if (fs.existsSync(middlewarePath)) {
  try {
    fs.unlinkSync(middlewarePath);
    console.log("--- BEAR: Deleted conflicting src/middleware.ts before startup ---");
  } catch (err) {
    console.error("Failed to delete middleware.ts:", err);
  }
}

// Set environment variables for Next.js port and hostname
process.env.PORT = process.env.PORT || "5175";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

console.log(`--- BEAR: Starting Next.js Dev Server on http://${process.env.HOSTNAME}:${process.env.PORT} ---`);

// Parse command line arguments
const args = process.argv.slice(2);
const finalArgs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--host") {
    // Already handled by process.env.HOSTNAME
    continue;
  } else if (arg === "--hostname" || arg === "-H") {
    if (args[i + 1]) {
      process.env.HOSTNAME = args[i + 1];
      i++;
    }
  } else if (arg === "--port" || arg === "-p") {
    if (args[i + 1]) {
      process.env.PORT = args[i + 1];
      i++;
    }
  } else {
    finalArgs.push(arg);
  }
}

// Run 'next dev' with the translated arguments
const nextDev = spawn("npx", ["next", "dev", ...finalArgs], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname
});

nextDev.on("close", (code) => {
  process.exit(code ?? 0);
});
