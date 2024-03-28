import React from "react";
import Header from "./components/views/Header";
import AppRouter from "./components/routing/routers/AppRouter";
import AudioRecorder from "./components/ui/AudioRecorder";

/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 * Updated by Marco Leder
 */
const App = () => {
  return (
    <div>
      {/* <Header height="100" />
      <AppRouter /> */}
      <AudioRecorder />
    </div>
  );
};

export default App;
