/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

const viteEnv = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env) ?? {};

export const WEB3FORMS_ACCESS_KEY = (viteEnv.VITE_WEB3FORMS_KEY ?? '').trim();

const COUNTER_NAMESPACE = (viteEnv.VITE_COUNTAPI_NAMESPACE ?? '').trim();
const COUNTER_NAME = (viteEnv.VITE_COUNTAPI_NAME ?? '').trim();

export const COUNTER_CONFIGURED = Boolean(COUNTER_NAMESPACE && COUNTER_NAME);
export const FEEDBACK_CONFIGURED = Boolean(WEB3FORMS_ACCESS_KEY);

export interface FeedbackPayload {
  name: string;
  email: string;
  category: 'question' | 'feedback' | 'bug' | 'other';
  message: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  if (!FEEDBACK_CONFIGURED) {
    throw new Error('Web3Forms is not configured. Set VITE_WEB3FORMS_KEY in .env.');
  }
  const body = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `[AuditAI Range · ${payload.category}] ${payload.name || 'Anonymous'}`,
    from_name: payload.name || 'AuditAI Range visitor',
    email: payload.email || 'no-reply@auditai-range.local',
    message: payload.message,
    category: payload.category,
    // Web3Forms will reply-to this if provided.
    replyto: payload.email || undefined,
  };
  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Submission failed (${res.status})`);
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (typeof data === 'object' && data !== null && 'success' in data && (data as { success: unknown }).success === false) {
    const msg = (data as { message?: string }).message || 'Submission rejected.';
    throw new Error(msg);
  }
}

function extractCount(payload: unknown): number | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const obj = payload as Record<string, unknown>;
  if (typeof obj.count === 'number') return obj.count;
  if (typeof obj.value === 'number') return obj.value;
  const data = obj.data as Record<string, unknown> | undefined;
  if (data && typeof data.count === 'number') return data.count;
  if (data && typeof data.up_count === 'number') return data.up_count;
  return null;
}

async function pingCounter(increment: boolean): Promise<number | null> {
  if (!COUNTER_CONFIGURED) return null;
  // counterapi.dev v1: GET /v1/{namespace}/{name}[/up] → { count }
  const path = increment ? 'up' : '';
  const url = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_NAME)}${path ? '/' + path : ''}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    return extractCount(json);
  } catch {
    return null;
  }
}

const VISIT_FLAG = 'auditai-visit-counted';

export function useVisitorCount(): { count: number | null; configured: boolean } {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!COUNTER_CONFIGURED) return;
    let cancelled = false;

    const alreadyCounted = sessionStorage.getItem(VISIT_FLAG) === '1';
    const op = alreadyCounted ? pingCounter(false) : pingCounter(true);

    op.then(n => {
      if (cancelled) return;
      if (n !== null) {
        setCount(n);
        if (!alreadyCounted) sessionStorage.setItem(VISIT_FLAG, '1');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { count, configured: COUNTER_CONFIGURED };
}
