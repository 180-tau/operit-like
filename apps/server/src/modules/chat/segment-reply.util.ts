// Segmented reply pipeline — splits streamed text into short segments
// with human-like typing delays (virtual companion experience).

export interface SegmentPlan {
  segments: string[];
  delaysMs: number[];
}

/** Split text into reply segments by sentence boundaries, then by length. */
export function splitIntoSegments(text: string, maxChars = 48): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Split on sentence/clause boundaries (CN + EN + newlines + ellipsis)
  const parts = trimmed.split(/(?<=[。！？!?…；;\n])/);
  const merged: string[] = [];
  let cur = '';

  for (const part of parts) {
    cur += part;
    const norm = cur.trim();
    if (norm.length >= 8 || /[。！？!?\n]$/.test(cur)) {
      merged.push(norm);
      cur = '';
    }
  }
  if (cur.trim()) merged.push(cur.trim());

  // Further split oversized segments (fallback to hard cut)
  const out: string[] = [];
  for (const seg of merged) {
    if (seg.length <= maxChars) {
      out.push(seg);
    } else {
      // Try clause boundary first (，、,)
      const clauses = seg.split(/(?<=[，、,])/);
      let buf = '';
      for (const cl of clauses) {
        if ((buf + cl).length > maxChars && buf) {
          out.push(buf);
          buf = cl;
        } else {
          buf += cl;
        }
      }
      if (buf.trim()) out.push(buf.trim());
      // Hard cut any remaining oversized piece
      const last = out.pop();
      if (last && last.length > maxChars) {
        for (let i = 0; i < last.length; i += maxChars) {
          out.push(last.slice(i, i + maxChars));
        }
      } else if (last) {
        out.push(last);
      }
    }
  }

  return out.filter((s) => s.length > 0);
}

/** Human-like delays: base + jitter, scaled by segment length. */
export function computeDelays(segments: string[], baseDelayMs = 450, jitterMs = 260): number[] {
  return segments.map((seg) => {
    const len = seg.length;
    // Typing-like: longer segment => longer delay; short punctuation-heavy => quick
    const scaled = baseDelayMs * (0.6 + Math.min(len / 24, 1.4));
    const jitter = Math.floor(Math.random() * jitterMs);
    return Math.round(scaled + jitter);
  });
}

/** Build a complete segment plan for a reply. */
export function planSegments(text: string, opts?: { maxChars?: number; baseDelayMs?: number; jitterMs?: number }): SegmentPlan {
  const segments = splitIntoSegments(text, opts?.maxChars);
  const delaysMs = computeDelays(segments, opts?.baseDelayMs, opts?.jitterMs);
  return { segments, delaysMs };
}
