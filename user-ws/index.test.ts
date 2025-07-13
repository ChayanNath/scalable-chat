import { describe, expect, test } from "bun:test";

const BACKEND_URL_1 = "ws://localhost:8080";
const BACKEND_URL_2 = "ws://localhost:8081";

function waitForOpen(ws: WebSocket): Promise<void> {
  return new Promise((resolve) => {
    ws.onopen = () => resolve();
  });
}

function waitForMessage(ws: WebSocket): Promise<any> {
  return new Promise((resolve) => {
    ws.onmessage = (event) => resolve(JSON.parse(event.data));
  });
}

describe("Chat application", () => {
  test("should be able to send and receive messages", async () => {
    const ws1 = new WebSocket(BACKEND_URL_1);
    const ws2 = new WebSocket(BACKEND_URL_2);

    await Promise.all([waitForOpen(ws1), waitForOpen(ws2)]);
    ws1.send(JSON.stringify({ type: "join-room", room: "test-room" }));
    ws2.send(JSON.stringify({ type: "join-room", room: "test-room" }));

    await new Promise((r) => setTimeout(r, 100));
    const message = { type: "chat", room: "test-room", text: "hello" };
    ws1.send(JSON.stringify(message));

    const received = await waitForMessage(ws2);
    expect(received).toEqual({
      type: "chat",
      room: "test-room",
      text: "hello",
    });

    ws1.close();
    ws2.close();
  });
});
