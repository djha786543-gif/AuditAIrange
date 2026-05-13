/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertTriangle, Mail, Send, Loader2 } from 'lucide-react';
import { submitFeedback, FEEDBACK_CONFIGURED, type FeedbackPayload } from '../lib/analytics';

const OWNER_EMAIL = 'djha786543@gmail.com';

const CATEGORIES: { value: FeedbackPayload['category']; label: string; hint: string }[] = [
  { value: 'question', label: 'Question', hint: 'Ask about a workpaper, task, or concept.' },
  { value: 'feedback', label: 'Feedback', hint: 'Share what worked or what was confusing.' },
  { value: 'bug', label: 'Bug report', hint: 'Something broken or unexpected in the portal.' },
  { value: 'other', label: 'Other', hint: 'Anything else.' },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function FeedbackView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<FeedbackPayload['category']>('question');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length > 0 && status !== 'sending';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('sending');
    setErrorMsg(null);
    try {
      await submitFeedback({ name: name.trim(), email: email.trim(), category, message: trimmedMessage });
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
      setCategory('question');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed.');
    }
  };

  const mailtoHref = (() => {
    const subject = encodeURIComponent(`[AuditAI Range · ${category}] ${name || 'Visitor'}`);
    const body = encodeURIComponent(
      `${trimmedMessage}\n\n—\nFrom: ${name || '(anonymous)'}${email ? ` <${email}>` : ''}`,
    );
    return `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
  })();

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Contact</p>
        <h1 className="text-3xl font-bold mt-1.5 tracking-tight gradient-text leading-tight">Feedback &amp; questions</h1>
        <p className="text-zinc-500 mt-2">
          Send a note directly to the maintainer. Replies go to your email if you include one.
        </p>
      </header>

      {!FEEDBACK_CONFIGURED && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-700 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900 flex-1">
            <p className="font-semibold">In-app email delivery is not yet configured.</p>
            <p className="text-amber-800 mt-1">
              Get a free access key at{' '}
              <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="underline font-semibold">
                web3forms.com
              </a>{' '}
              (enter <code className="bg-amber-100 px-1 rounded">{OWNER_EMAIL}</code>) and add{' '}
              <code className="bg-amber-100 px-1 rounded">VITE_WEB3FORMS_KEY</code> to <code className="bg-amber-100 px-1 rounded">.env</code>.
              Until then, you can use the “Open in email client” button below.
            </p>
          </div>
        </div>
      )}

      <div className="soft-card p-6 md:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Your name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={status === 'sending'}
                maxLength={120}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Jane Auditor"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Your email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === 'sending'}
                maxLength={200}
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Category</span>
            <div className="mt-1.5 grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORIES.map(c => {
                const active = category === c.value;
                return (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    disabled={status === 'sending'}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                      active
                        ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 via-white to-pink-50 text-zinc-900'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-indigo-200'
                    }`}
                    aria-pressed={active}
                  >
                    <p className="font-bold text-zinc-900">{c.label}</p>
                    <p className="text-zinc-500 mt-0.5">{c.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Message</span>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              disabled={status === 'sending'}
              rows={7}
              maxLength={5000}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-y"
              placeholder="What would you like to share?"
            />
            <span className="block text-[10px] text-zinc-400 mt-1 text-right">{trimmedMessage.length}/5000</span>
          </label>

          {status === 'sent' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-900">Thanks — your message was sent. You should get a reply soon.</p>
            </div>
          )}
          {status === 'error' && errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={16} className="text-rose-700 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-900 flex-1">{errorMsg}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 underline-offset-4 hover:underline"
            >
              <Mail size={14} />
              Open in email client instead
            </a>
            <button
              type="submit"
              disabled={!canSubmit || !FEEDBACK_CONFIGURED}
              className="btn-accent justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-zinc-400">
        Messages are delivered to <span className="font-mono">{OWNER_EMAIL}</span>. Your email address is only used so the
        maintainer can reply.
      </p>
    </div>
  );
}
