import React from "react";
import Header from "./components/views/Header";
import AppRouter from "./components/routing/routers/AppRouter";
import {VolumeBar} from "components/ui/VolumeBar";

/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 * Updated by Marco Leder
 */
const App = () => {
  let volume = 0.5;
  let setVolume = (volume) => {
    console.log(volume);
  };
  return (
    <div>
      <VolumeBar/>
      {/* <Header height="100" />
      <AppRouter /> */}
    </div>
  );
};

export default App;
