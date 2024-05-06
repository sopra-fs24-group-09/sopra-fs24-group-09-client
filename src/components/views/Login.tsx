import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import User from "models/User";
import {Link, useNavigate} from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Login.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { MAX_USERNAME_LENGTH, HTTP_STATUS } from "../../constants/constants";
import { showToast} from "../../helpers/toastService";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */
const FormField = (props) => {
  return (
    <div className="login field">
      <label className="login label">{props.label}</label>
      <input
        className="login input"
        placeholder="enter here.."
        value={props.value}
        type={props.type}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string
};

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const doLogin = async () => {
    try {
      const requestBody = JSON.stringify({ username, password });
      const response = await api.post("/users/login", requestBody);

      // Get the returned user and update a new object.
      const user = new User(response.data);

      sessionStorage.setItem("token", user.token);
      sessionStorage.setItem("id", user.id);
      sessionStorage.setItem("username", user.username);

      // Login successfully worked --> navigate to the route /game in the LobbyRouter
      showToast("Login successful!", "success");
      navigate("/lobby");
    } catch (error) {
      let message = "An unexpected error occurred during login.";
      if (error.response) {
        switch (error.response.status) {
        case HTTP_STATUS.NOT_FOUND:
          message = "Login failed: Username was not found.";
          break;
        case HTTP_STATUS.FORBIDDEN:
          message = "Login failed: Incorrect username or password.";
          break;
        default:
          message = `Login failed: ${error.response.data.reason || "Please try again later."}`;
        }
      } else {
        // No response from the server
        message = "The server cannot be reached. Did you start it?";
      }
      showToast(message, "error");
    }
  };

  return (
    <BaseContainer>
      <div className="login container">
        <div className="login kaeps-title">Kaeps</div>
        <div className="login form">
          <FormField
            label="Username"
            value={username}
            type="text"
            onChange={(un: string) => {
              if (un.length <= MAX_USERNAME_LENGTH) setUsername(un)
            }}
          />
          <FormField
            label="Password"
            value={password}
            type="password"
            onChange={(n: any) => {
              if (n.length <= MAX_USERNAME_LENGTH) setPassword(n)
            }}
          />
          <div className="login button-container">
            <Button
              disabled={!username || !password || username.trim() ===" " || password.trim() ===" "}
              width="100%"
              onClick={() => doLogin()}
              style={{ color: "black"}}
            >
              Login
            </Button>
          </div>

          <div className="login button-container">
              Dont have an account?
            <Link to={"/register"}>Sign up</Link>
          </div>
          
        </div>
      </div>
    </BaseContainer>
  );
};

/**
 * You can get access to the history object's properties via the useLocation, useNavigate, useParams, ... hooks.
 */
export default Login;
