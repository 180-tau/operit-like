import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Tool } from './tool.interface.js';

const execAsync = promisify(exec);
const SANDBOX_DIR = process.env.TOOL_SANDBOX_DIR ?? '/tmp/operit-sandbox';

export async function ensureSandbox(): Promise<string> {
  await fs.mkdir(SANDBOX_DIR, { recursive: true });
  return SANDBOX_DIR;
}

export async function builtinTools(): Promise<Tool[]> {
  await ensureSandbox();
  return [timeTool, httpGetTool, fileReadTool, fileWriteTool, codeExecTool];
}

const timeTool: Tool = {
  name: 'get_current_time',
  description: 'Get the current date and time (useful for time-related questions).',
  parameters: { type: 'object', properties: {}, required: [] },
  permission: 'none',
  async execute() {
    return { ok: true, data: new Date().toISOString() };
  },
};

const httpGetTool: Tool = {
  name: 'http_get',
  description: 'Fetch a URL and return its text content (web pages / public APIs).',
  parameters: {
    type: 'object',
    properties: { url: { type: 'string', description: 'http(s) URL' }, timeoutMs: { type: 'number', description: 'timeout in ms, default 10000' } },
    required: ['url'],
  },
  permission: 'network',
  async execute(args) {
    const url = String(args.url ?? '');
    if (!/^https?:\/\//.test(url)) return { ok: false, error: 'invalid URL' };
    const timeout = Number(args.timeoutMs ?? 10000);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      const text = await res.text();
      return { ok: res.ok, data: { status: res.status, contentType: res.headers.get('content-type'), body: text.slice(0, 12000) } };
    } catch (e) {
      return { ok: false, error: `fetch failed: ${e}` };
    } finally {
      clearTimeout(t);
    }
  },
};

const fileReadTool: Tool = {
  name: 'file_read',
  description: 'Read a text file inside the sandbox directory.',
  parameters: { type: 'object', properties: { filename: { type: 'string' } }, required: ['filename'] },
  permission: 'file.read',
  async execute(args) {
    const name = String(args.filename ?? '');
    const full = path.join(SANDBOX_DIR, path.basename(name));
    try {
      const content = await fs.readFile(full, 'utf-8');
      return { ok: true, data: content.slice(0, 12000) };
    } catch (e) {
      return { ok: false, error: `read failed: ${e}` };
    }
  },
};

const fileWriteTool: Tool = {
  name: 'file_write',
  description: 'Write text content to a file inside the sandbox directory.',
  parameters: { type: 'object', properties: { filename: { type: 'string' }, content: { type: 'string' } }, required: ['filename', 'content'] },
  permission: 'file.write',
  async execute(args) {
    const name = String(args.filename ?? '');
    const content = String(args.content ?? '');
    const full = path.join(SANDBOX_DIR, path.basename(name));
    try {
      await fs.writeFile(full, content, 'utf-8');
      return { ok: true, data: { path: full, bytes: content.length } };
    } catch (e) {
      return { ok: false, error: `write failed: ${e}` };
    }
  },
};

const codeExecTool: Tool = {
  name: 'code_exec',
  description: 'Execute JavaScript (node) or Python code in a sandboxed subprocess with a 10s timeout.',
  parameters: {
    type: 'object',
    properties: { language: { type: 'string', enum: ['js', 'python'] }, code: { type: 'string' } },
    required: ['language', 'code'],
  },
  permission: 'terminal',
  async execute(args) {
    const lang = String(args.language ?? 'js');
    const code = String(args.code ?? '');
    const file = path.join(SANDBOX_DIR, `exec-${Date.now()}.${lang === 'python' ? 'py' : 'js'}`);
    try {
      await fs.writeFile(file, code, 'utf-8');
      const cmd = lang === 'python' ? `timeout 10 python3 ${file}` : `timeout 10 node ${file}`;
      const { stdout, stderr } = await execAsync(cmd, { timeout: 12000 });
      return { ok: true, data: { stdout: stdout.slice(0, 8000), stderr: stderr.slice(0, 2000) } };
    } catch (e) {
      return { ok: false, error: `exec failed: ${e}` };
    } finally {
      await fs.unlink(file).catch(() => {});
    }
  },
};
