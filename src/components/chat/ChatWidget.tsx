"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, CircleCheck, Loader2, MessageCircle, RotateCcw, Send, ShoppingCart, X } from "lucide-react";
import { site } from "@/config/site";
import { getProduct } from "@/data/products";
import { useCart } from "@/lib/cart";
import { Markdown } from "@/components/chat/Markdown";
import type { ChatEvent } from "@/app/api/chat/route";

type Message =
  | { role: "user" | "assistant"; content: string }
  | { role: "notice"; content: string; tone: "success" | "error" };

const STORAGE_KEY = "plantsense-chat-v1";
const GREETING = `Hi! I'm Sprout 🌱 I can help you pick the right watering kit, explain setup, or answer questions about orders. What are you growing?`;
const SUGGESTIONS = ["Which kit is right for me?", "I don't have an outdoor tap", "How long can I go on holiday?", "Shipping & returns"];

export function ChatWidget() {
  const pathname = usePathname();
  const { add } = useCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [nudge, setNudge] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore the conversation for this browser tab
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate once on mount
      if (saved?.messages) setMessages(saved.messages);
      setSessionId(saved?.sessionId ?? crypto.randomUUID());
    } catch {
      setSessionId(crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, messages }));
    } catch {}
  }, [messages, sessionId]);

  // Gentle one-time nudge after a while on the page
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("plantsense-chat-nudged") === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      setNudge(true);
      try {
        sessionStorage.setItem("plantsense-chat-nudged", "1");
      } catch {}
    }, 20000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNudge(false);
    // On touch devices, don't pop the keyboard over the suggestions
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, 2000);
      if (!content || busy) return;
      setInput("");
      const history = [...messages, { role: "user" as const, content }];
      setMessages(history);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let reply = "";
      const appendReply = (delta: string) => {
        const starting = reply === "";
        reply += delta;
        const content = reply;
        setMessages((prev) =>
          starting ? [...prev, { role: "assistant", content }] : [...prev.slice(0, -1), { role: "assistant", content }],
        );
      };
      const notice = (content: string, tone: "success" | "error") => {
        setMessages((prev) => [...prev, { role: "notice", content, tone }]);
        reply = ""; // a following reply starts a new bubble
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            sessionId,
            page: pathname,
            messages: history.filter((m): m is Extract<Message, { role: "user" | "assistant" }> => m.role !== "notice"),
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          notice(
            res.status === 503
              ? `Our assistant is offline right now. You can reach us at ${site.contact.email} or ${site.contact.phone}.`
              : (data.error ?? "Something went wrong. Please try again."),
            "error",
          );
          return;
        }

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as ChatEvent;
            if (event.type === "delta") appendReply(event.text);
            else if (event.type === "lead_saved") notice("Your details were sent to our team — we'll be in touch soon.", "success");
            else if (event.type === "add_to_cart") {
              add(event.slug, event.quantity);
              notice(`Added ${event.quantity} × ${getProduct(event.slug)?.shortName ?? "item"} to your cart.`, "success");
            } else if (event.type === "error") notice(event.message, "error");
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") notice("Connection lost. Please check your internet and try again.", "error");
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, messages, sessionId, pathname, add],
  );

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setSessionId(crypto.randomUUID());
    inputRef.current?.focus();
  };

  const showSuggestions = messages.length === 0 && !busy;
  const waitingForFirstToken = busy && messages[messages.length - 1]?.role === "user";

  return (
    <>
      {/* Launcher */}
      <div className={`fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6 ${open ? "max-sm:hidden" : ""}`}>
        {nudge && !open && (
          <div className="flex max-w-60 animate-fade-up items-start gap-2 rounded-2xl rounded-br-sm border border-line bg-white p-3 text-sm shadow-lg">
            <button type="button" className="text-left" onClick={() => setOpen(true)}>
              Need help choosing a kit? I can recommend one in a minute.
            </button>
            <button type="button" aria-label="Dismiss" className="text-muted hover:text-ink" onClick={() => setNudge(false)}>
              <X className="size-4" aria-hidden />
            </button>
          </div>
        )}
        <button
          ref={launcherRef}
          type="button"
          onClick={() => (open ? close() : setOpen(true))}
          aria-expanded={open}
          aria-controls="chat-panel"
          className="flex h-14 items-center gap-2 rounded-full bg-leaf-700 pr-5 pl-4 font-semibold text-white shadow-lg shadow-leaf-900/25 transition hover:bg-leaf-800"
        >
          {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
          <span>{open ? "Close" : "Ask Sprout"}</span>
        </button>
      </div>

      {/* Panel */}
      {open && (
        <section
          id="chat-panel"
          role="dialog"
          aria-label="Chat with Sprout, our shopping assistant"
          className="fixed inset-0 z-50 flex animate-fade-up flex-col bg-white sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:rounded-3xl sm:border sm:border-line sm:shadow-2xl sm:shadow-leaf-900/20"
        >
          <header className="flex items-center gap-3 border-b border-line bg-leaf-800 px-4 py-3 text-white sm:rounded-t-3xl">
            <span className="grid size-10 place-items-center rounded-full bg-leaf-600">
              <Bot className="size-5" aria-hidden />
            </span>
            <div className="flex-1">
              <h2 className="font-semibold">Sprout</h2>
              <p className="flex items-center gap-1.5 text-xs text-leaf-200">
                <span className="size-2 rounded-full bg-leaf-300" aria-hidden /> AI shopping assistant · replies instantly
              </p>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={reset} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Start a new conversation" title="New conversation">
                <RotateCcw className="size-4" aria-hidden />
              </button>
            )}
            <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Close chat">
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-cream/60 px-4 py-4" aria-live="polite" aria-busy={busy}>
            <Bubble role="assistant">{GREETING}</Bubble>
            {messages.map((m, i) =>
              m.role === "notice" ? (
                <p
                  key={i}
                  className={`mx-auto flex w-fit max-w-[90%] items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    m.tone === "success" ? "bg-leaf-100 text-leaf-800" : "bg-red-50 text-red-800"
                  }`}
                >
                  {m.tone === "success" && (m.content.startsWith("Added") ? <ShoppingCart className="size-3.5" aria-hidden /> : <CircleCheck className="size-3.5" aria-hidden />)}
                  {m.content}
                </p>
              ) : (
                <Bubble key={i} role={m.role}>
                  {m.role === "assistant" ? <Markdown text={m.content} onNavigate={() => window.innerWidth < 640 && setOpen(false)} /> : m.content}
                </Bubble>
              ),
            )}
            {waitingForFirstToken && (
              <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm" aria-label="Sprout is typing">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="size-2 animate-bounce rounded-full bg-leaf-300" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            )}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-leaf-200 bg-white px-3 py-2 text-sm text-leaf-800 transition hover:border-leaf-500 hover:bg-leaf-50">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="border-t border-line bg-white p-3 sm:rounded-b-3xl"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">Type your message</label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={2000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about kits, setup, delivery…"
                className="field-input max-h-32 min-h-11 resize-none py-2.5"
              />
              <button type="submit" disabled={busy || !input.trim()} className="btn-primary size-11 shrink-0 p-0" aria-label="Send message">
                {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Send className="size-5" aria-hidden />}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">
              AI can make mistakes. We only share your details with our team if you say so.
            </p>
          </form>
        </section>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return role === "user" ? (
    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-leaf-600 px-4 py-2.5 text-[15px] whitespace-pre-wrap text-white">
      <span className="sr-only">You said: </span>
      {children}
    </div>
  ) : (
    <div className="w-fit max-w-[88%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-[15px] leading-relaxed shadow-sm">
      <span className="sr-only">Sprout said: </span>
      {children}
    </div>
  );
}
