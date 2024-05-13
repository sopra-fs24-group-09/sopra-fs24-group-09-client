import React, { useCallback, useRef, useEffect, useState } from "react";
import { api } from "helpers/api";
import { Button } from "components/ui/Button";
import { throttle } from "lodash";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User, Room } from "types";
import Popup from "components/ui/Popup";
import { Dropdown } from "components/ui/Dropdown";
import "styles/views/Lobby.scss";
import { getDomain } from "helpers/getDomain";
import "styles/ui/Popup.scss";
import { MAX_USERNAME_LENGTH, MAX_ROOM_NAME_LENGTH, HTTP_STATUS,AVATAR_LIST } from "../../constants/constants";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { showToast} from "../../helpers/toastService";
import { Timestamped, RoomInfo, RoomPlayer, PlayerAndRoomID } from "stomp_types";
const DEFAULT_MAX_PLAYERS = 5;
const DEFAULT_MIN_PLAYERS = 2;
const RESPONSE_TIME = 1000;

type PlayerProps = {
  user: User;
};

const Player: React.FC<PlayerProps> = ({ user }) => (
  <div className="player">
    <img
      src={"https://twemoji.maxcdn.com/v/latest/72x72/1f604.png"}
      alt={user.username}
      className="player-avatar"
    />
    <div className="player-username">{user.username}</div>
  </div>
);

Player.propTypes = {
  user: PropTypes.object,
};

const Lobby = () => {
  const navigate = useNavigate();
  const roomCreationPopRef = useRef<HTMLDialogElement>(null);
  const profilePopRef = useRef<HTMLDialogElement>(null);
  const changeAvatarPopRef = useRef<HTMLDialogElement>(null);
  const infoPopRef = useRef<HTMLDialogElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [maxRoomPlayers, SetMaxRoomPlayers] = useState(DEFAULT_MIN_PLAYERS);
  const [roomTheme, setRoomTheme] = useState("");
  const stompClientRef = useRef(null);

  const logout = async () => {
    const id = sessionStorage.getItem("id");
    //apply a post request for user logout
    try {
      const requestBody = JSON.stringify({ id: id });
      const response = await api.post("/users/logout", requestBody);
      console.log(response);
      sessionStorage.clear();
    } catch (error) {
      showToast("Something went wrong during the logout: \n${handleError(error)}",  "error");
    }
    navigate("/login");
  };
  async function fetchData() {
    // Get user ID from sessionStorage
    const userId = sessionStorage.getItem("id");
    if (userId) {
      // Get current user's information
      /// handle error outside
      // try {
      const userResponse = await api.get(`/users/${userId}`);
      setUser(userResponse.data);  // Set user data from API
      console.log("User data:", userResponse.data);
      // } catch (error) {
      // handleError(error);

      return;
      // }
    } else {
      console.error("User ID not found in sessionStorage!");
    }
  }

  useEffect(() => {
    const connectWebSocket = () => {
      const baseurl = getDomain();
      let Sock = new SockJS(`${baseurl}/ws`);
      stompClientRef.current = over(Sock);
      stompClientRef.current.connect({}, onConnected, onError);
    };
    let lobbyInfoSuber;

    const onConnected = () => {
      // subscribe to the topic
      lobbyInfoSuber = stompClientRef.current.subscribe(
        "/lobby/info",
        onLobbyInfoReceived
      );
      stompClientRef.current?.send(
        "/app/message/lobby/info", { receiptId: "" }
      );


    };

    const onLobbyInfoReceived = (message) => {
      const message_lobby = JSON.parse(message.body);
      if (message_lobby && message_lobby.message) {
        // make sure message.message is timestamped<roomInfo[]>
        const payload: RoomInfo[] = message_lobby.message;
        // if me is in the room, redirect to the room
        // const meIngameRoom = payload.some(room => room.roomPlayersList.some(user => user.userId === sessionStorage.getItem("id")))
        // if (meIngameRoom) {
        //   console.log("[DEBUG] Found me in the room, redirecting to the room page" + payload);
        //   const Room = payload.find(room => room.roomPlayersList.some(user => user.userId === sessionStorage.getItem("id")));
        //   navigate(`/rooms/${Room.roomId}/${Room.roomName}`);
        //   showToast("Reconnect to your previous room!", "success");
        // }

        setRooms(payload); 
        console.log("Rooms updated:", message_lobby.message);
      } else {
        console.error("Received data is not in expected format:", message_lobby);
      }
    };

    const onError = (error) => {
      console.error("WebSocket Error:", error);
      // handleError(error);
      // if error is network error, clear the session and navigate to login page
      showToast("Whoops! Lost connection to sever!", "error");
      sessionStorage.clear();
      navigate("/login");
    };

    // make sure user was fetched before set timeoutId
    fetchData().catch(error => {
      handleError(error);
    });

    connectWebSocket();


    return () => {
      if (lobbyInfoSuber) {
        lobbyInfoSuber.unsubscribe();
      }

      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log("Disconnected");
        });
      }
    };

  }, []);

  // when user get navigated back to this page, fetch data again
  // const location = useLocation();
  // console.warn("Location:", location);
  const RELOAD_TIME_MS = 500;
  // when first time loading the page, check if the user is in the room
  useEffect(() => {
    // wait for 1 second before fetching data
    const timeoutId = setTimeout(() => {
      console.log("========check if already in room========");
      console.warn("Rooms:", rooms);
      const meInRoom = rooms.some(room => room.roomPlayersList.some(user => user.userId === sessionStorage.getItem("id")))
      console.log("Me in room:", meInRoom);
      if (meInRoom) {
        console.log("[DEBUG] Found me in the room, redirecting to the room page" + rooms);
        const Room = rooms.find(room => room.roomPlayersList.some(user => user.userId === sessionStorage.getItem("id")));
        navigate(`/rooms/${Room.roomId}/${Room.roomName}`);
        showToast("Reconnect to your previous room!", "success");
      }
    }, RELOAD_TIME_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [rooms]);

  const doEdit = async () => {
    try {
      const requestBody = JSON.stringify({ username: username, avatar: avatar });
      const id = sessionStorage.getItem("id");
      console.log("Request body:", requestBody);
      await api.put(`/users/${id}`, requestBody);
      updateUsername(username);
      toggleProfilePop();
    } catch (error) {
      handleError(error);

      return;
    }
  };

  const createRoom = async () => {
    // if not chrome, alert the user
    if (!navigator.userAgent.includes("Chrome")) {
      showToast("Your browser is currently not supported, please use Chrome to play this game!","error");
      
      return;
    }
    try {
      console.log("Current theme:", roomTheme);
      const ownerId = sessionStorage.getItem("id");  // 假设ownerId存储在sessionStorage中
      const requestBody = JSON.stringify({
        roomName: roomName,
        maxPlayersNum: maxRoomPlayers,
        roomOwnerId: ownerId,
        theme: roomTheme
      });
      console.log(requestBody)
      const response = await api.post("/games", requestBody);
      console.log("Room created successfully:", response);
      console.log("Room ID:", response.data.roomId);
      const roomId = response.data.roomId;
      navigate(`/rooms/${roomId}/${roomName}`);
      //toggleRoomCreationPop();  
    } catch (error) {
      handleError(error);

      return;
    }
  };

  const toggleRoomCreationPop = () => {
    // if the ref is not set, do nothing
    if (!roomCreationPopRef.current) {
      return;
    }
    // if the dialog is open, close it. Otherwise, open it.
    roomCreationPopRef.current.hasAttribute("open")
      ? roomCreationPopRef.current.close()
      : roomCreationPopRef.current.showModal();
  };

  const toggleProfilePop = () => {
    // if the ref is not set, do nothing
    if (!profilePopRef.current) {
      return;
    }
    // if the dialog is open, close it. Otherwise, open it.
    profilePopRef.current.hasAttribute("open")
      ? profilePopRef.current.close()
      : profilePopRef.current.showModal();
  };

  // async function enterRoom(roomId, userId) {
  //   try {
  //     const requestBody = JSON.stringify({ id: userId });
  //     // await api.put(`/games/${roomId}`, requestBody);
  //   } catch (error) {
  //     handleError(error);

  //     return;
  //   }
  // }

  const toggleAvatarPop = () => {
    // if the ref is not set, do nothing
    if (!changeAvatarPopRef.current) {
      return;
    }
    // if the dialog is open, close it. Otherwise, open it.
    changeAvatarPopRef.current.hasAttribute("open")
      ? changeAvatarPopRef.current.close()
      : changeAvatarPopRef.current.showModal();
  };


  const toggleInfoPop = () => {
    // if the ref is not set, do nothing
    if (!infoPopRef.current) {
      return;
    }
    // if the dialog is open, close it. Otherwise, open it.
    infoPopRef.current.hasAttribute("open")
      ? infoPopRef.current.close()
      : infoPopRef.current.showModal();
  };

  const changeAvatar = async (newAvatar) => {
    try {
      // 更新本地状态
      setAvatar(newAvatar);

      // 构造请求体，只包含 avatar 更改
      const requestBody = JSON.stringify({ avatar: newAvatar });
      const id = sessionStorage.getItem("id");
      console.log("Request body:", requestBody);
      await api.put(`/users/${id}`, requestBody);
      console.log("Avatar changed successfully");
      updateAvatar(newAvatar);
    } catch (error) {
      handleError(error);

      return;
    }
  }

  const updateAvatar = (newAvatar) => {
    setUser(prevUser => ({
      ...prevUser, // 复制 prevUser 对象的所有现有属性
      avatar: newAvatar // 更新 avatar 属性
    }));
  };

  const updateUsername = (newUsername) => {
    setUser(prevUser => ({
      ...prevUser, // 复制 prevUser 对象的所有现有属性
      username: newUsername // 更新 avatar 属性
    }));
  };

  ///
  /// if error is network error, clear the session and navigate to login page
  /// if unauthorized, clear the session and navigate to login page
  ///
  const handleError = (error) => {
    // Check if there's a response object in the error
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized errors
      if (status === HTTP_STATUS.UNAUTHORIZED) {
        console.error("Unauthorized: " + data.message + "\n" + error);
        showToast("Your session has expired or is invalid. Please log in again.", "error");
        sessionStorage.clear();
        navigate("/login");
      } else if (status === HTTP_STATUS.FORBIDDEN) {
        // Handle 403 Forbidden errors
        console.error("Forbidden: Access is denied. " + data.message + "\n" + error);
        showToast("Access is denied. You do not have permission to access this resource.", "error");
      } else {
        // Handle other types of errors generically
        console.error(`Error: ${data.message}\n${error}`);
        showToast("An error occurred: ${data.message}", "error");
      }
    } else if (error.message && error.message.match(/Network Error/)) {
      // Handle network errors
      console.error(`The server cannot be reached.\nDid you start it?\n${error}`);
      showToast(`The server cannot be reached.\nDid you start it?\n${error}`);
      sessionStorage.clear();
      navigate("/login");
      showToast("The server cannot be reached.\nDid you start it?", "error");
    } else {
      console.error(`Something went wrong: \n${error}`);
      showToast("Something went wrong: \n${error}", "error");
    }
  }

  const throttledClickHandler = throttle((Room, navigate, showToast) => {
    try {
      // Check if the session token is empty
      const token = sessionStorage.getItem("token");
      if (!token) {
        showToast("Session expired or invalid, please log in again.", "error");
        sessionStorage.clear(); // Clear session storage
        navigate("/login");
        
        return; // Exit the function to avoid further processing
      }

      if (Room.roomPlayersList.length === Room.roomMaxNum) {
        showToast("Room is Full, please enter another room!", "error");
      } else if (Room.status === "In Game") {
        showToast("Game is already started, please enter another room!", "error");
      } else {
        navigate(`/rooms/${Room.roomId}/${Room.roomName}`);
      }
    } catch (error) {
      console.error(`Something went wrong during the enterRoom: \n${error}`);
      showToast(`Something went wrong during the enterRoom: \n${error}`, "error");
    }
  }, RESPONSE_TIME);

  const handleRoomClick = useCallback((Room) => (e) => {
    e.preventDefault();
    throttledClickHandler(Room, navigate, showToast);
  }, [navigate, showToast]);

  const renderRoomLists = () => {
    return rooms.map((Room) => {
      const playerSlots = [];

      // 生成玩家头像或空白框，总数等于房间最大玩家数
      for (let i = 0; i < Room.roomMaxNum; i++) {
        if (i < Room.roomPlayersList.length) {
          const user = Room.roomPlayersList[i];
          playerSlots.push(
            <div className="player" key={i}>
              <i className={`twa twa-${user.avatar}`} style={{ fontSize: "3.8rem" }} />
              <div className="name">{user.userName}</div>
            </div>
          );
        } else {
          // 空白框
          playerSlots.push(
            <div className="player" key={i}>

            </div>
          );
        }
      }

      return (
        <div className="room-container" key={Room.roomId} onClick={handleRoomClick(Room)}>
          <div className="room-players">
            {playerSlots}
          </div>
          <div className="room-header">
            <div style={{ fontWeight: "bold" }}>{Room.roomName}</div>
            <div>{Room.theme}</div>
            <span
              className={`room-status ${Room.status === "INGAME" ? "in-game" : Room.status === "WAITING" ? "waiting" : "game-over"}`}>
              {Room.status}
            </span>
          </div>
        </div>
      )
    });
  };

  if (user === null) {
    return <BaseContainer>Loading...</BaseContainer>;
  }

  return (
    <BaseContainer>
      <div className="user-container">
        <i className={"twa twa-" + user.avatar}
          onClick={toggleProfilePop}
          style={{
            fontSize: "3.8rem",
            marginTop: "0.8rem",
            cursor: "pointer"
          }} />
        <div className="name">{user.username}</div>
        <div className="btn-logout-container">
          <Button className="logout-btn" onClick={logout}>logout</Button>
        </div>
      </div>
      <div className="title-container">
        <div className="big-title">Kaeps</div>
        <div className="information" onClick={toggleInfoPop}>i</div>
      </div>

      <div className="lobby room-list-wrapper">
        {/* for clip the scrollbar inside the border */}
        <div className="lobby room-list">
          <h1>Rooms</h1>
          {renderRoomLists()}
        </div>
        <div className="lobby room-list btn-container">
          <Button className="create-room-btn" onClick={toggleRoomCreationPop}>
            New Room
          </Button>
        </div>
      </div>


      <Popup ref={profilePopRef} toggleDialog={toggleProfilePop} className="profile-popup">
        <BaseContainer className="profile-popup content">
          <div className="avatar-container" onClick={() => {
            toggleAvatarPop();
            toggleProfilePop();
          }}>
            <i className={"twa twa-" + user.avatar} style={{ fontSize: "10rem", marginTop: "0.8rem", textAlign: "center" }} />
          </div>
          <div className="profile-popup field">
            <label className="profile-popup label">
              Username:
            </label>
            <input
              // className="profile-popup input"
              style={{ height: "40px" }}
              placeholder={user.username}
              type="text"
              value={username}
              onChange={(e) => {
                const inputValue = e.target.value;  // 获取输入值
                if (inputValue.length <= MAX_USERNAME_LENGTH && inputValue.length > 0) {  // 检查输入值的长度
                  setUsername(inputValue);  // 如果长度小于或等于20，更新状态
                }
              }}
            />
          </div>
          <div>Id: {user.id}</div>
          <div>Status: {user.status}</div>

          {/*<div>RegisterDate: {user && new Date(user.registerDate).toLocaleDateString()}</div>*/}

          <div className="profile-popup btn-container">
            <Button className="cancel" onClick={() => {
              toggleProfilePop();
            }}>
              Cancel
            </Button>
            <Button className="cancel" 
              onClick={() => doEdit()}
              disabled = {username === "" || username === user.username}
            >
              Edit
            </Button>
          </div>
        </BaseContainer>
      </Popup>

      <Popup
        ref={changeAvatarPopRef}
        toggleDialog={toggleAvatarPop}
        className="room-creation-popup"
      >
        <div className="avatar-list">
          {AVATAR_LIST?.map((avatar, index) => (
            <div className="player" key={index} >
              <i className={"twa twa-" + avatar} style={{ fontSize: "3.8rem" }} onClick={() => {
                changeAvatar(avatar).then(r => toggleAvatarPop);
                toggleAvatarPop();
              }} />
            </div>
          ))}
        </div>
      </Popup>

      <Popup
        ref={roomCreationPopRef}
        toggleDialog={toggleRoomCreationPop}
        className="room-creation-popup"
      >
        <BaseContainer className="room-creation-popup content">
          <div className="title">Create Room</div>
          <div>Room Name: </div>
          <input
            type="text"
            placeholder="Max. 10"
            value={roomName}
            onChange={(e) => {
              const inputValue = e.target.value;  // 获取输入值
              if (inputValue.length <= MAX_ROOM_NAME_LENGTH) {  // 检查输入值的长度
                setRoomName(inputValue);  // 如果长度小于或等于15，更新状态
              }
            }}
          />
          <div>Number of Maximum Players: </div>
          <input
            type="number"
            placeholder="Number of Maximum Players"
            value={maxRoomPlayers}
            onChange={e => {
              const value = parseInt(e.target.value);
              // console.error("Value:", value);
              SetMaxRoomPlayers(value >= DEFAULT_MIN_PLAYERS && value <= DEFAULT_MAX_PLAYERS ? value : DEFAULT_MIN_PLAYERS);
            }}
            min={DEFAULT_MIN_PLAYERS}
            max={DEFAULT_MAX_PLAYERS}
          />
          <Dropdown
            className="theme-dropdown"
            prompt="Select Theme"
            // defaultValue={roomTheme}
            options={[
              { value: "JOB", label: "JOB" },
              { value: "FOOD", label: "FOOD" },
              { value: "SUPERHERO", label: "SUPERHERO" },
              { value: "SPORTS", label: "SPORTS" },
            ]}
            onChange={(value) => setRoomTheme(value)}
          />
          <div className="room-creation-popup btn-container">
            <Button disabled={roomName === "" || maxRoomPlayers < DEFAULT_MIN_PLAYERS || maxRoomPlayers > DEFAULT_MAX_PLAYERS || roomTheme === ""}
              className="create-room" onClick={createRoom}>Create Room</Button>
            <Button className="cancel" onClick={toggleRoomCreationPop}>Cancel</Button>
          </div>
        </BaseContainer>

      </Popup>

      <Popup ref={infoPopRef} toggleDialog={toggleInfoPop} className="intro-popup">
        <div className="intro-cnt">
          <h1>Welcome to KAEPS!</h1>
          <p>Here are some guides to help you get started with the game:</p>
          <ul>
            <li><strong>Speaker:</strong> The speaker receives a word, records it, inverts the recording, and then sends this inverted audio to other players.</li>
            <li><strong>Challenger:</strong> Challengers listen to the inverted audio sent by the speaker.
              You must mimic this recording and then play their recording backwards to guess the original word.
              You can guess multiple times before time is up.
            </li>
            <li><strong>Scoring:</strong> Points are awarded for correctly guessing the word. The faster you guess, the more points you earn.</li>
            <li><strong>Turns:</strong> The game is played in rounds. Each round has one speaker and several challengers. Players alternate roles as the Speaker to ensure fairness.</li>
          </ul>
          <p>Join a room or create one to play with friends!</p>

        </div>
        <div className="intro-popup btn-container">
          <Button className="cancel" onClick={toggleInfoPop}>
            Close
          </Button>
        </div>
      </Popup>
    </BaseContainer>
  );
};

export default Lobby;
