/**
 * Verification script for command deployment structure
 * Does NOT require actual Discord credentials
 */

console.log('🔍 Verifying deploy-commands.js structure...\n');

// Check if the file exists and can be parsed
import { readFileSync } from 'fs';

const deployScript = readFileSync('./src/deploy-commands.js', 'utf-8');

// Verify required imports
const checks = [
  { name: 'REST import', pattern: /import.*REST.*from.*discord\.js/, pass: false },
  { name: 'Routes import', pattern: /import.*Routes.*from.*discord\.js/, pass: false },
  { name: 'dotenv import', pattern: /import.*dotenv/, pass: false },
  { name: 'DISCORD_TOKEN check', pattern: /DISCORD_TOKEN/, pass: false },
  { name: 'CLIENT_ID check', pattern: /CLIENT_ID/, pass: false },
  { name: 'status command definition', pattern: /name:\s*['"]status['"]/, pass: false },
  { name: 'detailed option', pattern: /name:\s*['"]detailed['"]/, pass: false },
  { name: 'applicationGuildCommands route', pattern: /applicationGuildCommands/, pass: false },
  { name: 'applicationCommands route', pattern: /applicationCommands/, pass: false },
  { name: 'Error handling', pattern: /catch.*error/, pass: false },
];

for (const check of checks) {
  check.pass = check.pattern.test(deployScript);
  console.log(check.pass ? '✓' : '✗', check.name);
}

const allPassed = checks.every(c => c.pass);

if (allPassed) {
  console.log('\n✅ deploy-commands.js structure verified!');
  console.log('   Ready to deploy when Discord credentials are provided.');
} else {
  console.log('\n❌ Some checks failed!');
  process.exit(1);
}
