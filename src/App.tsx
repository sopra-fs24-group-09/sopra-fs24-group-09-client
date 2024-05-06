import React from "react";
import AppRouter from "./components/routing/routers/AppRouter";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Happy coding!
 * React Template by Lucas Pelloni
 * Overhauled by Kyrill Hux
 * Updated by Marco Leder
 */
const App = () => {
  return (
    <div>
      <ToastContainer />
      <AppRouter />
    </div>
  );
};

export default App;
