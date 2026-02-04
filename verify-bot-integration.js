/**
 * Verification script for bot integration
 * Checks that health monitoring and commands are properly integrated
 */

console.log('🔍 Verifying bot integration...\n');

import { readFileSync } from 'fs';

const botScript = readFileSync('./src/index.js', 'utf-8');

const checks = [
  { name: 'HealthMonitor import', pattern: /import.*HealthMonitor.*from.*health\.js/, pass: false },
  { name: 'Status command import', pattern: /import.*statusCommand.*from.*commands\/status\.js/, pass: false },
  { name: 'HealthMonitor getInstance', pattern: /HealthMonitor\.getInstance/, pass: false },
  { name: 'recordStart in ready event', pattern: /healthMonitor\.recordStart/, pass: false },
  { name: 'recordAIRequest tracking', pattern: /healthMonitor\.recordAIRequest/, pass: false },
  { name: 'setAPIStatus tracking', pattern: /healthMonitor\.setAPIStatus/, pass: false },
  { name: 'interactionCreate handler', pattern: /client\.on\(['"]interactionCreate['"]/, pass: false },
  { name: 'isChatInputCommand check', pattern: /isChatInputCommand/, pass: false },
  { name: 'status command routing', pattern: /case ['"]status['"]/, pass: false },
  { name: 'statusCommand.execute call', pattern: /statusCommand\.execute/, pass: false },
];

for (const check of checks) {
  check.pass = check.pattern.test(botScript);
  console.log(check.pass ? '✓' : '✗', check.name);
}

const allPassed = checks.every(c => c.pass);

if (allPassed) {
  console.log('\n✅ Bot integration verified!');
  console.log('   Health monitoring is properly integrated into bot lifecycle.');
  console.log('   Status command is properly wired to interactionCreate handler.');
} else {
  console.log('\n❌ Some integration checks failed!');
  process.exit(1);
}
