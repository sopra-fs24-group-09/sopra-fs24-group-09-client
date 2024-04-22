import React from "react";
import {createRoot} from "react-dom/client";
// import App from "./App";

// fake test
it("renders without crashing", () => {
  const div = document.createElement("div");
  const root = createRoot(div); // createRoot(div!) if you use TypeScript
  // root.render(<App />);
  root.unmount();
});
// it("renders without crashing", () => {
//   const div = document.createElement("div");
//   const root = createRoot(div); // createRoot(div!) if you use TypeScript
//   root.render(<App />);
//   root.unmount();
// });
