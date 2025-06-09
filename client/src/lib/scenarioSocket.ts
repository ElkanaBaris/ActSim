export function createScenarioSocket() {
  const socket = new WebSocket("ws://localhost:5000/v2");

  socket.addEventListener("open", () => {
    console.log("\uD83D\uDD17 Scenario WS connected");
  });

  socket.addEventListener("message", (evt) => {
    const msg = JSON.parse(evt.data);
    console.log("\uD83D\uDCE9 Scenario:", msg);
    // TODO: dispatch into your state/store so your UI can react
  });

  socket.addEventListener("close", () => {
    console.log("\uD83D\uDD0C Scenario WS disconnected");
  });

  socket.addEventListener("error", (err) => {
    console.error("\u26A0\uFE0F Scenario WS error", err);
  });

  return socket;
}
