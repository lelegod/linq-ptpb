// [B] One chat() interface, two providers. Swapping is one env var.
//
//   LLM_PROVIDER=groq       (default — Groq, free tier, llama-3.3-70b-versatile)
//   LLM_PROVIDER=anthropic  (claude-haiku-4-5, needs credit)
//
// If the primary throws, we transparently retry once on the other provider —
// so a rate-limit on stage does not kill the demo.

import type { LlmMessage, LlmResult, ToolSpec, ToolCall } from './types';

export type LlmProvider = 'groq' | 'anthropic';

const PRIMARY = (process.env.LLM_PROVIDER ?? 'groq') as LlmProvider;

// Groq's free-tier token budget is PER MODEL PER DAY (100k). When one model's
// bucket is empty, the next model still has a full one — so we keep a list and
// walk down it on a rate limit. GROQ_MODEL (singular) still works and wins.
const GROQ_MODELS: string[] = (
  process.env.GROQ_MODEL ??
  process.env.GROQ_MODELS ??
  'llama-3.3-70b-versatile,openai/gpt-oss-120b,moonshotai/kimi-k2-instruct'
)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);
const GROQ_MODEL = GROQ_MODELS[0];
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5';
const TEMPERATURE = Number(process.env.LLM_TEMPERATURE ?? 0.3);
const MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS ?? 900);

export type ChatInput = {
  system: string;
  messages: LlmMessage[];
  tools: ToolSpec[];
};

// ---------------------------------------------------------------------------
// Groq (OpenAI-compatible chat completions)
// ---------------------------------------------------------------------------

let groqClient: any = null;
async function getGroq() {
  if (!groqClient) {
    const mod: any = await import('groq-sdk');
    const Groq = mod.default ?? mod.Groq;
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function toOpenAiMessages(system: string, messages: LlmMessage[]): any[] {
  const out: any[] = [{ role: 'system', content: system }];
  for (const m of messages) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.content });
    } else if (m.role === 'assistant') {
      const msg: any = { role: 'assistant', content: m.content ?? '' };
      if (m.toolCalls?.length) {
        msg.tool_calls = m.toolCalls.map((t) => ({
          id: t.id,
          type: 'function',
          function: { name: t.name, arguments: JSON.stringify(t.args ?? {}) },
        }));
      }
      out.push(msg);
    } else {
      out.push({ role: 'tool', tool_call_id: m.toolCallId, name: m.name, content: m.content });
    }
  }
  return out;
}

function safeParse(s: unknown): Record<string, unknown> {
  if (typeof s !== 'string' || !s.trim()) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/**
 * Llama sometimes emits its pseudo-XML call format instead of a JSON tool call:
 *   <function=get_status {"trip_id": "..."}</function>
 * Groq rejects that with a 400 `tool_use_failed` and hands the raw text back in
 * `failed_generation`. Rather than burn a retry, we parse it — the model picked
 * the right tool, it just wrote it down wrong.
 */
function salvageToolCall(err: unknown): LlmResult | null {
  const raw = JSON.stringify((err as any)?.error ?? '') + String((err as any)?.message ?? '');
  if (!/tool_use_failed|failed_generation/.test(raw)) return null;

  const text = raw.replace(/\\"/g, '"').replace(/\\n/g, '\n');
  // Two shapes seen in the wild, both from Groq's Llama family:
  //   <function=get_status {"a":1}</function>     (70b)
  //   <function=plan_trip>{"a":1}                 (8b — note the '>')
  const m = text.match(/<function=([a-zA-Z_][\w]*)\s*>?\s*(\{[\s\S]*?\})/);
  if (!m) return null;

  const args = safeParse(m[2]);
  console.warn(`[B][llm] salvaged a malformed tool call: ${m[1]}(${JSON.stringify(args)})`);
  return { text: null, toolCalls: [{ id: `salvaged_${m[1]}`, name: m[1], args }] };
}

async function chatGroq({ system, messages, tools }: ChatInput, model: string = GROQ_MODEL): Promise<LlmResult> {
  const groq = await getGroq();
  const res = await groq.chat.completions.create({
    model,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
    messages: toOpenAiMessages(system, messages),
    tools: tools.map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parameters },
    })),
    tool_choice: 'auto',
  });
  const choice = res.choices?.[0]?.message ?? {};
  const toolCalls: ToolCall[] = (choice.tool_calls ?? []).map((tc: any, i: number) => ({
    id: tc.id ?? `call_${i}`,
    name: tc.function?.name ?? 'unknown',
    args: safeParse(tc.function?.arguments),
  }));
  return { text: choice.content ?? null, toolCalls };
}

// ---------------------------------------------------------------------------
// Anthropic
// ---------------------------------------------------------------------------

let anthropicClient: any = null;
async function getAnthropic() {
  if (!anthropicClient) {
    // Indirect specifier: the package is optional (no Anthropic credit today),
    // so this must not be a hard compile-time dependency.
    const pkg = '@anthropic-ai/sdk';
    const mod: any = await import(pkg);
    const Anthropic = mod.default ?? mod.Anthropic;
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function toAnthropicMessages(messages: LlmMessage[]): any[] {
  const out: any[] = [];
  for (const m of messages) {
    if (m.role === 'user') {
      out.push({ role: 'user', content: m.content });
    } else if (m.role === 'assistant') {
      const blocks: any[] = [];
      if (m.content) blocks.push({ type: 'text', text: m.content });
      for (const t of m.toolCalls ?? []) {
        blocks.push({ type: 'tool_use', id: t.id, name: t.name, input: t.args ?? {} });
      }
      if (blocks.length) out.push({ role: 'assistant', content: blocks });
    } else {
      // tool results are user-role content blocks in the Anthropic API
      const prev = out[out.length - 1];
      const block = { type: 'tool_result', tool_use_id: m.toolCallId, content: m.content };
      if (prev && prev.role === 'user' && Array.isArray(prev.content)) prev.content.push(block);
      else out.push({ role: 'user', content: [block] });
    }
  }
  return out;
}

async function chatAnthropic({ system, messages, tools }: ChatInput): Promise<LlmResult> {
  const anthropic = await getAnthropic();
  const res = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    system,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
    messages: toAnthropicMessages(messages),
    tools: tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })),
  });
  let text: string | null = null;
  const toolCalls: ToolCall[] = [];
  for (const block of res.content ?? []) {
    if (block.type === 'text') text = (text ?? '') + block.text;
    if (block.type === 'tool_use') {
      toolCalls.push({ id: block.id, name: block.name, args: (block.input ?? {}) as Record<string, unknown> });
    }
  }
  return { text, toolCalls };
}

// ---------------------------------------------------------------------------

function hasKey(p: LlmProvider): boolean {
  return p === 'groq' ? !!process.env.GROQ_API_KEY : !!process.env.ANTHROPIC_API_KEY;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRateLimit(err: unknown): boolean {
  const e = err as any;
  return e?.status === 429 || e?.statusCode === 429 || /rate.?limit|429/i.test(String(e?.message ?? ''));
}

/** Groq's 429 tells us how long to wait: "Please try again in 3.175s". */
function retryAfterMs(err: unknown): number {
  const m = String((err as any)?.message ?? '').match(/try again in ([\d.]+)s/i);
  return m ? Math.ceil(Number(m[1]) * 1000) + 250 : 2500;
}

/** A daily-quota 429 is permanent for hours — don't wait it out, change model. */
function isDailyQuota(err: unknown): boolean {
  return /tokens per day|TPD/i.test(String((err as any)?.message ?? ''));
}

type Attempt = { provider: LlmProvider; model: string };

/** The single entry point. Everything else in /src/agent calls this. */
export async function chat(input: ChatInput): Promise<LlmResult> {
  const groqAttempts: Attempt[] = GROQ_MODELS.map((model) => ({ provider: 'groq' as const, model }));
  const anthropicAttempts: Attempt[] = [{ provider: 'anthropic' as const, model: ANTHROPIC_MODEL }];
  const attempts = PRIMARY === 'groq' ? [...groqAttempts, ...anthropicAttempts] : [...anthropicAttempts, ...groqAttempts];

  let lastErr: unknown = null;

  for (const { provider, model } of attempts) {
    if (!hasKey(provider)) continue;

    // Per-minute limits are worth waiting out. Per-DAY limits are not — those
    // just mean this model's bucket is empty, so move to the next one.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const started = Date.now();
        const out =
          provider === 'groq' ? await chatGroq(input, model) : await chatAnthropic(input);
        console.log(
          `[B][llm] ${provider}/${model} ok in ${Date.now() - started}ms · tools=${out.toolCalls.map((t) => t.name).join(',') || 'none'}`,
        );
        return out;
      } catch (err) {
        lastErr = err;

        if (provider === 'groq') {
          const salvaged = salvageToolCall(err);
          if (salvaged) return salvaged;
        }

        if (isRateLimit(err) && isDailyQuota(err)) {
          console.warn(`[B][llm] ${provider}/${model} is out of daily tokens — switching model`);
          break;
        }

        if (isRateLimit(err) && attempt === 0) {
          const wait = retryAfterMs(err);
          console.warn(`[B][llm] ${provider}/${model} rate-limited, waiting ${wait}ms and retrying`);
          await sleep(wait);
          continue;
        }

        console.error(`[B][llm] ${provider}/${model} failed, trying next:`, err instanceof Error ? err.message : err);
        break;
      }
    }
  }
  throw new Error(`all LLM providers failed: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
}

export function llmStatus() {
  return {
    primary: PRIMARY,
    groqKey: !!process.env.GROQ_API_KEY,
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    groqModels: GROQ_MODELS,
    anthropicModel: ANTHROPIC_MODEL,
  };
}
