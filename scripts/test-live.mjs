// DRAA Master Test Runner
// Runs Phase 1 (Core API, RBAC, Catalog & Routes) and Phase 2 (Business Logic Workflows)
import { spawn } from 'node:child_process';
import path from 'node:path';

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> Running: ${scriptPath}`);
    const proc = spawn('node', [scriptPath], { stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script ${scriptPath} exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

async function main() {
  try {
    await runScript(path.resolve('scripts/test-live-suite.mjs'));
    await runScript(path.resolve('scripts/test-advanced-flows.mjs'));
    console.log('\n✅ ALL LIVE TESTING SUITES PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILURE:', err.message);
    process.exit(1);
  }
}

main();
