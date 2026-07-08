"use client";

type HubMessage = {
  type: string;
  action: string;
  key: string;
  payload?: unknown;
  id: string;
};

export class AimakeHubClient {
  private iframe: HTMLIFrameElement | null = null;
  private isReady = false;
  private messageQueue: HubMessage[] = [];
  private callbacks = new Map<string, (value: unknown) => void>();

  // Use the local hub for development, and the production hub otherwise
  private hubUrl =
    process.env.NODE_ENV === "development" ? "http://localhost:3007" : "https://hub.aimake.cc";

  public init() {
    if (typeof window === "undefined" || this.iframe) return;

    this.iframe = document.createElement("iframe");
    this.iframe.src = this.hubUrl;
    this.iframe.style.display = "none";
    document.body.appendChild(this.iframe);

    window.addEventListener("message", (e) => {
      if (
        !e.origin.includes("localhost") &&
        !e.origin.includes("aimake.cc") &&
        !e.origin.includes("vercel.app")
      )
        return;

      const data = e.data;
      if (data?.type === "AIMAKE_HUB_REPLY" || data?.type === "AIMAKE_HUB_ACK") {
        if (data.action === "READY") {
          this.isReady = true;
          this.flushQueue();
          return;
        }
        const cb = this.callbacks.get(data.id);
        if (cb) {
          cb(data.payload);
          this.callbacks.delete(data.id);
        }
      }
    });
  }

  private flushQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      this.iframe?.contentWindow?.postMessage(msg, "*");
    }
  }

  private send(action: string, key: string, payload?: unknown): Promise<unknown> {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(7);
      this.callbacks.set(id, resolve);
      const msg = { type: "AIMAKE_HUB", action, key, payload, id };

      if (this.isReady && this.iframe?.contentWindow) {
        this.iframe.contentWindow.postMessage(msg, "*");
      } else {
        this.messageQueue.push(msg);
      }
    });
  }

  public setItem(key: string, value: unknown): Promise<void> {
    return this.send("SET", key, value) as Promise<void>;
  }

  public getItem(key: string): Promise<unknown> {
    return this.send("GET", key);
  }
}

// Singleton instance
export const aimakeHub = typeof window !== "undefined" ? new AimakeHubClient() : null;
