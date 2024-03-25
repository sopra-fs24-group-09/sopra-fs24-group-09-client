import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User } from "types";
import "styles/views/Gameroom.scss";
import "styles/twemoji-amazing.css";

const Gameroom = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(null);

  // useEffect(() => {
  //   //fetch room info
  //   async function fetchData() {
  //     try {
  //       const response = await api.get("/users");
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //       setUsers(response.data);
  //       console.log(response);
  //     } catch (error) {
  //       console.error(
  //         `Something went wrong while fetching the users: \n${handleError(
  //           error
  //         )}`
  //       );
  //       console.error("Details:", error);
  //       alert(
  //         "Something went wrong while fetching the users! See the console for details."
  //       );
  //     }
  //   }
  //   fetchData();
  // }, []);

  const playerReadyStatus = [
    {
      user: {
        id: 1,
        name: "Maxwell",
        avatar: "smiling-face-with-smiling-eyes",
      },
      ready: true
    },
    {
      user: {
        id: 2,
        name: "Hanky",
        avatar: "grinning-face-with-sweat",
      },
      ready: true
    },
    {
      user: {
        id: 3,
        name: "Yang",
        avatar: "face-with-monocle",
      },
      ready: false
    },
    // Add more player objects as needed
  ];

  const PlayerList = ({ playerStatus }) => {
    return (
      <>

      <div className="gameroom roominfocontainer">
        <div className={"gameroom roomifotitle"}> ROOM </div>
        <div className={"gameroom roominfo"}> #05 - Advanced  </div>
      </div>
      <div className="gameroom playercontainer">
        {playerStatus.map((playerInfo, index) => (
          <div className="gameroom singlePlayerContainer" key={index}>
            {/*<img src={playerInfo.user.avatar} alt={playerInfo.user.name} />*/}
            <span className="gameroom playerAvatar">
              <i className={"twa twa-" + playerInfo.user.avatar} style={{ fontSize: "3.8rem" }}/>
            </span>
            <span className="gameroom playerName">{playerInfo.user.name}</span>{/* Conditionally render the check mark or clock icon based on player status */}
            <div className ="gameroom playerStatus">
            {playerInfo.ready ? (
              <i className="twa twa-check-mark-button" style={{ fontSize: "1.5rem" }} />
            ) : (
              <i className="twa twa-one-thirty" style={{ fontSize: "1.5rem" }} />
            )}
            </div>
          </div>
        ))}
      </div>
      </>
    );
  };

  PlayerList.propTypes = {
    playerStatus: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          avatar: PropTypes.string.isRequired
        }).isRequired,
        ready: PropTypes.bool.isRequired
      })
    ).isRequired
  };

  return (
    <BaseContainer >
      <PlayerList playerStatus={playerReadyStatus} />
      <div className="gameroom inputarea"></div>
    </BaseContainer>
  );
};

export default Gameroom;
