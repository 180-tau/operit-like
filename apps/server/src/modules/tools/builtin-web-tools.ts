import { Tool } from './tool.interface.js';

/** Web-related tools: search / translate / weather / math. */

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Search the web via Bing and return top result titles, URLs and snippets.',
  parameters: { type: 'object', properties: { query: { type: 'string' }, maxResults: { type: 'number' } }, required: ['query'] },
  permission: 'network',
  async execute(args) {
    const q = encodeURIComponent(String(args.query ?? ''));
    const max = Math.min(Number(args.maxResults ?? 5), 10);
    try {
      const res = await fetch(`https://cn.bing.com/search?q=${q}`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
      const html = await res.text();
      const results: { title: string; url: string; snippet: string }[] = [];
      // Simple chunk-based parsing to avoid complex regex escaping
      const chunks = html.split('<li class="b_algo"');
      for (const chunk of chunks.slice(1)) {
        if (results.length >= max) break;
        const hrefMatch = chunk.match(/href="([^"]+)"/);
        const titleMatch = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
        const pMatch = chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        const title = titleMatch && titleMatch[1] ? stripHtml(titleMatch[1]) : '';
        if (!title) continue;
        results.push({ title, url: hrefMatch?.[1] ?? '', snippet: pMatch && pMatch[1] ? stripHtml(pMatch[1]).slice(0, 200) : '' });
      }
      if (!results.length) return { ok: true, data: { note: 'no structured results parsed', raw: html.slice(0, 800) } };
      return { ok: true, data: results };
    } catch (e) {
      return { ok: false, error: `search failed: ${e}` };
    }
  },
};

const translateTool: Tool = {
  name: 'translate',
  description: 'Translate text between languages using MyMemory API (e.g. en|zh, zh|en).',
  parameters: {
    type: 'object',
    properties: { text: { type: 'string' }, to: { type: 'string', description: 'target language code, default en' }, from: { type: 'string', description: 'source language code, default auto' } },
    required: ['text'],
  },
  permission: 'network',
  async execute(args) {
    const text = String(args.text ?? '');
    const to = String(args.to ?? 'en');
    const from = String(args.from ?? 'auto');
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
      const res = await fetch(url);
      const json = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: string };
      if (json.responseData?.translatedText) return { ok: true, data: { translatedText: json.responseData.translatedText } };
      return { ok: false, error: `translate failed: status ${json.responseStatus}` };
    } catch (e) {
      return { ok: false, error: `translate failed: ${e}` };
    }
  },
};

const weatherTool: Tool = {
  name: 'weather',
  description: 'Get current weather for a city via wttr.in.',
  parameters: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
  permission: 'network',
  async execute(args) {
    const city = String(args.city ?? 'beijing');
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const json = (await res.json()) as {
        current_condition?: { temp_C?: string; weatherDesc?: { value?: string }[]; humidity?: string; windspeedKmph?: string; FeelsLikeC?: string }[];
      };
      const c = json.current_condition?.[0];
      if (!c) return { ok: false, error: 'no weather data' };
      return {
        ok: true,
        data: {
          city,
          tempC: c.temp_C,
          feelsLikeC: c.FeelsLikeC,
          desc: c.weatherDesc?.[0]?.value ?? 'n/a',
          humidity: c.humidity,
          windKmph: c.windspeedKmph,
        },
      };
    } catch (e) {
      return { ok: false, error: `weather failed: ${e}` };
    }
  },
};

const mathEvalTool: Tool = {
  name: 'math_eval',
  description: 'Evaluate a simple arithmetic expression (safe). Supports + - * / ( ) % ^ and numbers.',
  parameters: { type: 'object', properties: { expression: { type: 'string' } }, required: ['expression'] },
  permission: 'none',
  async execute(args) {
    let expr = String(args.expression ?? '');
    if (!/^[\d\s+\-*/().%^*]*$/.test(expr)) return { ok: false, error: 'expression contains unsupported characters' };
    expr = expr.replace(/\^/g, '**');
    try {
      const result = new Function(`"use strict"; return (${expr});`)();
      return { ok: true, data: { expression: expr, result } };
    } catch (e) {
      return { ok: false, error: `eval failed: ${e}` };
    }
  },
};

export function webTools(): Tool[] {
  return [webSearchTool, translateTool, weatherTool, mathEvalTool];
}