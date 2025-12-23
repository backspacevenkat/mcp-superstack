#!/usr/bin/env node
/**
 * MCP Superstack - Test All Servers
 *
 * Tests connectivity to all configured MCP servers.
 *
 * Usage: npm test
 */

import { config } from 'dotenv';
config();

console.log('\n🧪 MCP Superstack - Server Connectivity Test\n');

const results = [];

// Test helper
async function testServer(name, testFn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await testFn();
    console.log('✅ OK');
    results.push({ name, status: 'ok' });
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    results.push({ name, status: 'failed', error: err.message });
  }
}

// Check required environment variables
function checkEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

async function main() {
  // Test Polydev
  await testServer('polydev', async () => {
    const token = checkEnv('POLYDEV_USER_TOKEN');
    const response = await fetch('https://www.polydev.ai/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
  });

  // Test Exa
  await testServer('exa', async () => {
    const key = checkEnv('EXA_API_KEY');
    const response = await fetch(`https://mcp.exa.ai/mcp?exaApiKey=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  });

  // Test Vercel
  await testServer('vercel', async () => {
    const token = checkEnv('VERCEL_TOKEN');
    const team = checkEnv('VERCEL_TEAM');
    const project = checkEnv('VERCEL_PROJECT');

    const response = await fetch(`https://mcp.vercel.com/${team}/${project}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  });

  // Test Supabase
  await testServer('supabase', async () => {
    checkEnv('SUPABASE_ACCESS_TOKEN');
    checkEnv('SUPABASE_PROJECT_REF');
    // Supabase uses stdio, can't easily test without spawning
    console.log('(stdio server - config verified)');
  });

  // Test GitHub
  await testServer('github', async () => {
    const token = checkEnv('GITHUB_TOKEN');
    const response = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const user = await response.json();
    console.log(`(authenticated as ${user.login})`);
  });

  // Summary
  console.log('\n📊 Summary:');
  const ok = results.filter(r => r.status === 'ok').length;
  const failed = results.filter(r => r.status === 'failed').length;
  console.log(`   ✅ Passed: ${ok}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('Failed servers:');
    results.filter(r => r.status === 'failed').forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    console.log('');
    process.exit(1);
  }
}

main().catch(console.error);
