import React, { useCallback, useRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { throttle } from "lodash";
import { useLocation, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User, Room } from "types";
import Popup from "components/ui/Popup";
import { Dropdown } from "components/ui/Dropdown";
import "styles/views/Lobby.scss";
import { getDomain } from "helpers/getDomain";
import "styles/ui/Popup.scss";
import { MAX_USERNAME_LENGTH, MAX_ROOM_NAME_LENGTH } from "../../constants/constants";
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

interface FormFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

Player.propTypes = {
  user: PropTypes.object,
};

const avatarList: string[] = [
  "angry-face",
  "angry-face-with-horns",
  "anguished-face",
  "anxious-face-with-sweat",
  "astonished-face",
  "beaming-face-with-smiling-eyes",
  "cat-face",
  "clown-face",
  "cold-face",
  "confounded-face",
  "confused-face",
  "cow-face",
  "cowboy-hat-face",
  "crying-face",
  "disappointed-face",
  "disguised-face",
  "dog-face",
  "dotted-line-face",
  "downcast-face-with-sweat",
  "dragon-face",
  "drooling-face",
  "expressionless-face",
  "face-blowing-a-kiss",
  "face-exhaling",
  "face-holding-back-tears",
  "face-in-clouds",
  "face-savoring-food",
  "face-screaming-in-fear",
  "face-vomiting",
  "face-with-crossed-out-eyes",
  "face-with-diagonal-mouth",
  "face-with-hand-over-mouth",
  "face-with-head-bandage",
  "face-with-medical-mask",
  "face-with-monocle",
  "face-with-open-eyes-and-hand-over-mouth",
  "face-with-open-mouth",
  "face-with-peeking-eye",
  "face-with-raised-eyebrow",
  "face-with-rolling-eyes",
  "face-with-spiral-eyes",
  "face-with-steam-from-nose",
  "face-with-symbols-on-mouth",
  "face-with-tears-of-joy",
  "face-with-thermometer",
  "face-with-tongue",
  "face-without-mouth",
  "fearful-face",
  "first-quarter-moon-face",
  "flushed-face"
]

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
    sessionStorage.removeItem("token");
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

        setRooms(payload); // 确保这里是数组
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
      //toggleRoomCreationPop();  // 关闭创建房间的弹窗
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
  ///
  const handleError = (error) => {
    // if(!error.message){
    //   // if error message is undefined
    //   showToast("Something went wrong, please try again later.", "error");
    // }
    if (error.message.match(/Network Error/)) {
      console.error(`The server cannot be reached.\nDid you start it?\n${error}`);
      showToast(`The server cannot be reached.\nDid you start it?\n${error}`);
      sessionStorage.clear();
      navigate("/login");
      showToast("The server cannot be reached.\nDid you start it?", "error");
    } else {
      console.error(`Something went wrong: \n${error}`);
      showToast(`Something went wrong: \n${error}`);
    }
  }

  const throttledClickHandler = throttle((Room, navigate, showToast) => {
    try {
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
    return rooms.map((Room) => (
      <div
        className="room-container"
        key={Room.roomId}
        onClick={handleRoomClick(Room)}
        onKeyDown={(e) => { if (e.key === "Enter") handleRoomClick(Room); }}
        tabIndex="0"
        role="button"
        aria-label="Handle Room Click"
      >
        <div className="room-players">
          {Room.roomPlayersList?.map((user, index) => (
            <div className="player" key={index}>
              <i className={"twa twa-" + user.avatar} style={{ fontSize: "3.8rem" }} />
              <div className="name">{user.userName}</div>
            </div>
          ))}
        </div>
        <div className="room-header">
          <div style={{ fontWeight: "bold" }}>{Room.roomName}</div>
          <div>{Room.theme}</div>
          <span
            className={`room-status ${Room.status === "In Game" ? "in-game" : "free"
            }`}
          >
            {Room.status}
          </span>
        </div>
      </div>
    ));
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
          }}
          onKeyDown={(e) => { if (e.key === "Enter") toggleProfilePop(); }}
          tabIndex="0"
        />
        <div className="name">{user.username}</div>
        <div className="btn-logout-container">
          <Button className="logout-btn"
            onClick={logout}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                logout().catch((error) => console.error("Error logging out:", error));
              }
            }}
            tabIndex="0"
          >
            logout
          </Button>
        </div>
      </div>
      <div className="title-container">
        <div className="big-title">Kaeps</div>
        <div className="information"
          onClick={toggleInfoPop}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              toggleInfoPop();
            }
          }}
          tabIndex="0"
        >
          i
        </div>
      </div>

      <div className="lobby room-list-wrapper">
        {/* for clip the scrollbar inside the border */}
        <div className="lobby room-list">
          <h1>Rooms</h1>
          {renderRoomLists()}
        </div>
        <div className="lobby room-list btn-container">
          <Button className="create-room-btn"
            onClick={toggleRoomCreationPop}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleRoomCreationPop();
              }
            }}
            tabIndex="0"
          >
            New Room
          </Button>
        </div>
      </div>


      <Popup ref={profilePopRef} toggleDialog={toggleProfilePop} className="profile-popup">
        <BaseContainer className="profile-popup content">
          <div className="avatar-container"
            onClick={() => {
              toggleAvatarPop();
              toggleProfilePop();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleAvatarPop();
                toggleProfilePop();
              }
            }}
            tabIndex="0"
          >
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
            <Button className="cancel"
              onClick={() => {
                toggleProfilePop();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  toggleProfilePop();
                }
              }}
              tabIndex="0"
            >
              Cancel
            </Button>
            <Button className="cancel" 
              onClick={() => doEdit()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  doEdit().catch((error) => console.error("Error editing:", error));
                }
              }}
              tabIndex="0"
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
          {avatarList?.map((avatar, index) => (
            <div className="player" key={index} >
              <i className={"twa twa-" + avatar}
                style={{ fontSize: "3.8rem" }}
                onClick={() => {
                  changeAvatar(avatar).then(r => toggleAvatarPop);
                  toggleAvatarPop();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    changeAvatar(avatar).then(r => toggleAvatarPop);
                    toggleAvatarPop();
                  }
                }}
                tabIndex="0"
              />
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
              className="create-room" onClick={createRoom} onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createRoom().then(r => console.log("Create Room"));
                }
              }}
              tabIndex="0"
            >
              Create Room
            </Button>
            <Button className="cancel" onClick={toggleRoomCreationPop} onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleRoomCreationPop();
              }
            }}
            tabIndex="0"
            >
              Cancel
            </Button>
          </div>
        </BaseContainer>

      </Popup>

      <Popup ref={infoPopRef} toggleDialog={toggleInfoPop} className="intro-popup">
        <div className="intro-cnt">
          <h1>Welcome to KAEPS!</h1>
          <p>Here are some guides for playing this game:</p>
          <ul>
            <li><strong>Speaker:</strong> Receives a word, records it, inverts the audio, and sends it to other players.</li>
            <li><strong>Challenger:</strong> Receives the reversed audio recording from the speaker.
              The challenger should then mimic this reversed recording.
              After recording their own version of the reversed audio, they should play it backwards to guess the original word.</li>
            <li><strong>Scoring:</strong> Correctly deciphering the word scores you points.</li>
            <li><strong>Turns:</strong> Each round has one Speaker and multiple Challengers. Players take turns to be the Speaker.</li>
          </ul>
          <p>Join a room or create one to play with friends!</p>
        </div>
        <div className="intro-popup btn-container">
          <Button className="cancel" onClick={toggleInfoPop} onKeyDown={(e) => {
            if (e.key === "Enter") {
              toggleInfoPop();
            }
          }}
          tabIndex="0"
          >
            Close
          </Button>
        </div>
      </Popup>
    </BaseContainer>
  );
};

export default Lobby;
