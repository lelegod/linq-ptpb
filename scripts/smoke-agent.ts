// [B] Talk to the agent from a terminal — no Linq, no phone, no webhook.
//
//   npx tsx scripts/smoke-agent.ts            interactive
//   npx tsx scripts/smoke-agent.ts --script   full demo path
//
// Uses the in-memory store and prints outbound messages to the console instead
// of sending them, so it costs nothing but LLM tokens.

import 'dotenv/config';
import readline from 'node:readline';
import { handleTurnDetailed } from '../src/agent/runTurn';
import { createMemoryDb, createConsoleLinq } from '../src/agent/ports';
import type { Deps } from '../src/agent/ports';
import { llmStatus } from '../src/agent/llm';
import { transportStatus } from '../src/transport/rejseplanen';

const deps: Deps = {
  db: createMemoryDb(),
  linq: createConsoleLinq(),
  publicAppUrl: process.env.PUBLIC_APP_URL ?? 'http://localhost:3000',
};

const PHONE = '+4520000000';
const CHAT = 'smoke-chat-1';

async function say(text: string) {
  console.log(`\n\x1b[90m[you]\x1b[0m ${text}`);
  const t0 = Date.now();
  const { reply, toolCalls } = await handleTurnDetailed(PHONE, text, CHAT, deps);
  if (toolCalls.length) {
    console.log(`\x1b[90m      tools: ${toolCalls.map((t) => `${t.name}(${JSON.stringify(t.args)})`).join(' ')}\x1b[0m`);
  }
  if (reply) console.log(`\x1b[34m[rejsy]\x1b[0m ${reply}`);
  else console.log('\x1b[90m[rejsy] (no text — the card above was the reply)\x1b[0m');
  console.log(`\x1b[90m      ${Date.now() - t0}ms\x1b[0m`);
}

const DEMO_SCRIPT = [
  'hi',
  'how do i get to aarhus from copenhagen tomorrow at 9',
  '1',
  'will i make it if my meeting starts at 12:30',
  'save københavn h as home',
  'what do i have coming up',
];

async function main() {
  console.log('llm:', JSON.stringify(llmStatus()));
  console.log('transport:', JSON.stringify(transportStatus()));
  if (!process.env.GROQ_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error('\n⚠️  no GROQ_API_KEY set — every turn will fail.\n');
  }

  if (process.argv.includes('--script')) {
    for (const line of DEMO_SCRIPT) await say(line);
    console.log('\n--- demo script complete ---\n');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log('\ntype a message (ctrl-c to quit)\n');
  const ask = () =>
    rl.question('> ', async (line) => {
      const text = line.trim();
      if (text) {
        try {
          await say(text);
        } catch (err) {
          console.error('turn failed:', err);
        }
      }
      ask();
    });
  ask();
}

main();
