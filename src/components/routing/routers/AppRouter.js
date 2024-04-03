import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {LobbyGuard} from "../routeProtectors/LobbyGuard";
import LobbyRouter from "./LobbyRouter";
import {LoginGuard} from "../routeProtectors/LoginGuard";
import Register from "../../views/Register";
import Login from "../../views/Login";
import Gameroom from "../../views/Gameroom";
import Profile from "../../views/Profile";
import EditProfile from "../../views/Editprofile";
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

        <Route path="/lobby/*" element={<LobbyGuard />}>
          <Route path="/lobby/*" element={<LobbyRouter base="/lobby"/>} />
        </Route>

        <Route path="/login" element={<LoginGuard />}>
          <Route path="/login" element={<Login/>} />
        </Route>

        <Route path="/register" element={<LoginGuard />}>
          <Route path="/register" element={<Register/>} />
        </Route>

        {/* guard to user profile page */}
        <Route path="/user/:id" element={<LobbyGuard />}>
          <Route index element={<Profile />} />
        </Route>

        {/*no guard for now*/}
        <Route path="/rooms/:id" element={<Gameroom />} />
        
        <Route path="/editprofile" element={<LobbyGuard />}>
          <Route index element={<EditProfile />} />
        </Route>

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
