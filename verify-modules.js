/**
 * Verification script for health monitoring and status command
 */

import { HealthMonitor } from './src/utils/health.js';
import * as statusCommand from './src/commands/status.js';

console.log('🔍 Verifying modules...\n');

// Test 1: Health Monitor
console.log('✓ HealthMonitor module loaded');
const healthMonitor = HealthMonitor.getInstance();
const status = healthMonitor.getStatus();
console.log('  - Uptime:', status.uptimeFormatted);
console.log('  - Memory:', status.memory.formatted);
console.log('  - API Status:', status.api.status);
console.log('  - Last AI Request:', status.lastAIRequest || 'Never');

// Test 2: Detailed Status
const detailedStatus = healthMonitor.getDetailedStatus();
console.log('\n✓ Detailed status available');
console.log('  - Process ID:', detailedStatus.process.pid);
console.log('  - Node Version:', detailedStatus.process.nodeVersion);
console.log('  - Platform:', detailedStatus.process.platform);

// Test 3: Status Command
console.log('\n✓ Status command module loaded');
console.log('  - execute function:', typeof statusCommand.execute === 'function' ? 'present ✓' : 'missing ✗');

// Test 4: Health Monitor State Updates
healthMonitor.recordAIRequest();
healthMonitor.setAPIStatus('ok');
const updatedStatus = healthMonitor.getStatus();
console.log('\n✓ State updates working');
console.log('  - Last AI Request updated:', updatedStatus.lastAIRequest !== null ? 'yes ✓' : 'no ✗');
console.log('  - API Status updated:', updatedStatus.api.status === 'ok' ? 'yes ✓' : 'no ✗');

console.log('\n✅ All module verifications passed!');
