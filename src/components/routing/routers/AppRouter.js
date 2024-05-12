import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LobbyGuard} from "../routeProtectors/LobbyGuard";
import LobbyRouter from "./LobbyRouter";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import Register from "../../views/Register";
import Login from "../../views/Login";
import Gameroom from "../../views/Gameroom";
import RuleGuide from "../../views/RuleGuide";
/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/lobby".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /lobby renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reactrouter.com/en/main/start/tutorial 
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* global guard for all the routes */}
        <Route path="/*" element={<LoginGuard />}>
          <Route path="*" element={<Navigate to="/login" />} />
        </Route>

        <Route path="/lobby/*" element={<LobbyGuard />}>
          <Route path="*" element={<LobbyRouter base="/lobby"/>} />
        </Route>

        <Route path="/login" element={<LoginGuard />}>
          <Route path="/login" element={<Login/>} />
        </Route>

        <Route path="/register" element={<LoginGuard />}>
          <Route path="/register" element={<Register/>} />
        </Route>

        {/* no guard for gameroom page now*/}
        {/* the parameter name should match with the useParam in the Gameroom */}
        <Route path="/rooms/:currentRoomID/:currentRoomName" element={<LobbyGuard/>} >
          <Route path="" element={<Gameroom />} />
        </Route>

        <Route path="guide" element={<RuleGuide/>}/>

        <Route path="/" element={
          <Navigate to="/lobby" replace />
        }/>

      </Routes>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
