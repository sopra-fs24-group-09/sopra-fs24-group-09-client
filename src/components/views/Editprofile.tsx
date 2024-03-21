import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import "styles/views/Profile.scss";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";

const FormField = (props) => {
  return (
    <div className="login field">
      <label className="login label">{props.label}</label>
      <input
        className="login input"
        type={props.type || "text"}
        placeholder={props.placeholder || "enter here.."}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
  

const EditProfile = () => {
  const navigate = useNavigate();
  const userid = localStorage.getItem("id") ?? "";
  const currentUsername = localStorage.getItem("username") ?? "";
  const [id] = useState<string>(userid);
  const [username, setUsername] = useState<string | "">(currentUsername);
  const [birthday, setBirthday] = useState<string | "">("");

  const doEditProfile = async () => {

    if (!username.trim() || username.includes(" ")) {
      alert("Username cannot be empty or contain spaces.");
      
      return;
    }

    try {
      const requestBody = JSON.stringify({
        id: id,
        username: username,
        birthday: birthday,
      });
      await api.put(`/users/${id}`, requestBody);
      navigate(`/user/${id}`);
    } catch (error) {
      alert(`Something went wrong during the profile edit: \n${handleError(error)}`);
      // navigate("/game");
    }
  };

  return (
    <BaseContainer>
      <div className="profile container">

        <div className="profile name">UserID: {id}</div>

        <div className="profile form">
          <div className="profile container">
            <FormField
              label="Username"
              type="text"
              value={username || ""}
              onChange={setUsername}
            />

            <FormField
              label="Birthday"
              type="date"
              value={birthday}
              onChange={setBirthday}
            />
          </div>
        </div>

        <div className="login button-container">
          <Button width="100%" onClick={doEditProfile}>Save</Button>
        </div>

        <div className="login button-container">
          <Button width="100%" onClick={() => navigate(`/user/${id}`)}>Go back</Button>
        </div>
      </div>
    </BaseContainer>
  );
};

export default EditProfile;

