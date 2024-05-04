import React, { useRef, useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { User, Room } from "types";
import Popup from "components/ui/Popup";
import { Dropdown } from "components/ui/Dropdown";
import "styles/views/Lobby.scss";
import "styles/ui/Popup.scss";
import { MAX_USERNAME_LENGTH, MAX_ROOM_NAME_LENGTH } from "../../constants/constants";
const DEFAULT_MAX_PLAYERS = 5;
const DEFAULT_MIN_PLAYERS = 2;

type PlayerProps = {
  user: User;
};
type RoomComponentProps = {
  room: Room;
};

type RoomListProps = {
  rooms: Room[];
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
const RoomComponent: React.FC<RoomComponentProps> = ({ room }) => (
  <div className="room">
    <div className="room-header">
      {room.roomPlayersList.map((user) => (
        <Player key={user.id} user={user} />
      ))}
    </div>
    <div className="room-footer">
      <div className="room-theme">{room.theme}</div>
      <div
        className="room-status"
        style={{ color: room.status === "In Game" ? "orange" : "green" }}
      >
        {room.status}
      </div>
    </div>
  </div>
);
const RoomList: React.FC<RoomListProps> = ({ rooms }) => (
  <div className="room-list">
    {rooms.map((room) => (
      <RoomComponent key={room.id} room={room} />
    ))}
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

const FormField: React.FC<FormFieldProps> = (props) => {
  return (
    <div className="profile-popup field">
      <label className="profile-popup label">
        {props.label}
      </label>
      <input
        className="profile-popup input"
        placeholder={props.placeholder}
        value={props.value}
        type={props.type}
        onChange={e => props.onChange(e.target.value)}
        disabled={props.disabled}
      />
    </div>
  );
};
Player.propTypes = {
  user: PropTypes.object,
};

const mockRoomPlayers: User[] = [

  { id: "1", username: "Alice", avatar: "grinning-face-with-sweat", name: "Alice Wonderland", status: "ONLINE", registerDate: new Date("2021-08-01"), birthday: new Date("1990-01-01") },
  { id: "2", username: "Bob", avatar: "grinning-face-with-sweat", name: "Bob Builder", status: "OFFLINE", registerDate: new Date("2021-09-01"), birthday: new Date("1985-02-02") },
  { id: "3", username: "Han", avatar: "grinning-face-with-sweat", name: "Alice Wonderland", status: "ONLINE", registerDate: new Date("2021-08-01"), birthday: new Date("1990-01-01") },
  { id: "4", username: "Li", avatar: "grinning-face-with-sweat", name: "Bob Builder", status: "OFFLINE", registerDate: new Date("2021-09-01"), birthday: new Date("1985-02-02") },
  { id: "5", username: "Liuz", avatar: "grinning-face-with-sweat", name: "Bob Builder", status: "OFFLINE", registerDate: new Date("2021-09-01"), birthday: new Date("1985-02-02") },

];

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

const mockRooms: Room[] = [
  {
    id: "1",
    roomOwnerId: "1",
    roomPlayersList: mockRoomPlayers,
    theme: "Advanced",
    status: "In Game",
    maxPlayersNum: 4,
    alivePlayersList: mockRoomPlayers,
    currentPlayerIndex: 0,
    playToOuted: false,
  },
  {
    id: "2",
    roomOwnerId: "2",
    roomPlayersList: mockRoomPlayers,
    theme: "Food",
    status: "Free",
    maxPlayersNum: 4,
    alivePlayersList: mockRoomPlayers,
    currentPlayerIndex: 1,
    playToOuted: false,
  },
];

const Lobby = () => {
  const navigate = useNavigate();
  const roomCreationPopRef = useRef<HTMLDialogElement>(null);
  const profilePopRef = useRef<HTMLDialogElement>(null);
  const changeAvatarPopRef = useRef<HTMLDialogElement>(null);
  const infoPopRef = useRef<HTMLDialogElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<User[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [maxRoomPlayers, SetMaxRoomPlayers] = useState(DEFAULT_MIN_PLAYERS);
  const [roomTheme, setRoomTheme] = useState("");
  // const needReloadRooms = useRef(false);
  // const RELOAD_TIME = 3000;

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
      alert(`Something went wrong during the logout: \n${handleError(error)}`);
    }
    navigate("/login");
  };
  async function fetchData() {
    // try {
    // 获取所有房间信息
    const roomsResponse = await api.get("/games/lobby");
    console.log("Rooms data:", roomsResponse.data);

    // 使用 Promise.all 来并发获取每个房间的用户详细信息
    const roomsWithPlayerDetails = await Promise.all(roomsResponse.data.map(async (room) => {
      // 对每个房间的用户 ID 列表并发请求用户信息
      const playerDetails = await Promise.all(room.roomPlayersList.map(async (userId) => {
        const userResponse = await api.get(`/users/${userId}`);

        return userResponse.data;  // 返回用户的详细信息
      }));
    
      // needReloadRooms.current = false;

      // setTimeout(() => {
      //   needReloadRooms.current = true;
      // }, RELOAD_TIME);

      return {
        ...room,
        roomPlayersList: playerDetails  // 替换房间中的用户 ID 列表为用户详细信息
      };
    }));

    // 更新房间状态，包含了用户的详细信息
    setRooms(roomsWithPlayerDetails);

    console.log("request to:", roomsResponse.request.responseURL);
    console.log("status code:", roomsResponse.status);
    console.log("status text:", roomsResponse.statusText);
    console.log("requested data:", roomsResponse.data);

    // See here to get more data.
    console.log(roomsResponse);

    // Get user ID from sessionStorage
    const userId = sessionStorage.getItem("id");
    if (userId) {
      // Get current user's information
      try {
        const userResponse = await api.get(`/users/${userId}`);
        setUser(userResponse.data);  // Set user data from API
        console.log("User data:", userResponse.data);
      } catch (error) {
        handleError(error);
        
        return;
      }
    } else {
      console.error("User ID not found in sessionStorage!");
    }
    // } catch (error) {
    //   console.error(
    //     `Something went wrong while fetching the users: \n${handleError(
    //       error
    //     )}`
    //   );
    //   console.error("Details:", error);
    //   alert(
    //     "Something went wrong while fetching the users! See the console for details."
    //   );
    // }
  }

  useEffect(() => {
    fetchData().catch(error => {
      handleError(error);
    });
  }, []);

  // when user get navigated back to this page, fetch data again
  const location = useLocation();
  // console.warn("Location:", location);
  const RELOAD_TIME_MS = 500;
  useEffect(() => {
    // wait for 1 second before fetching data
    const timeoutId = setTimeout(() => {
      console.log("========fetchData========");
      fetchData().catch(error => {
        handleError(error);
      });
    }, RELOAD_TIME_MS);

    return () => {
      clearTimeout(timeoutId);
    }
  }, [location]);

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
      alert("Your browser is currently not supported, please use Chrome to play this game!");
      
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

  async function enterRoom(roomId, userId) {
    try {
      const requestBody = JSON.stringify({ id: userId });
      // await api.put(`/games/${roomId}`, requestBody);
    } catch (error) {
      handleError(error);
      
      return;
    }
  }

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

  const changeAvatar = async (newAvatar) =>{
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
    if(error.message.match(/Network Error/)) {
      console.error(`The server cannot be reached.\nDid you start it?\n${error}`);
      alert(`The server cannot be reached.\nDid you start it?\n${error}`);
      sessionStorage.clear();
      navigate("/login");
    } else {
      console.error(`Something went wrong: \n${error}`);
      alert(`Something went wrong: \n${error}`);
    }
  }


  const renderRoomLists = () => {
    return rooms.map((Room) => (
      <div className="room-container" key={Room.roomId} onClick={async (e) => {
        e.preventDefault();

        /// when user click the room, fetch the data again
        /// and check if the room is still in the list
        try {
          await fetchData();
        } catch (error) {
          handleError(error);
          
          return;
        }
        // check if roomId is still in the list
        const room = rooms.find(r => r.roomId === Room.roomId);
        if (!room) {
          alert("The room's info is outdated, please try again!");
          
          return;
        }
        
        const currentId = sessionStorage.getItem("id");
        const isPlayerInRoom = Room.roomPlayersList.join().includes(currentId);
        enterRoom(Room.roomId, currentId)
          .then(() => {
            //alert(currentId);
            if(Room.roomPlayersList.length===Room.maxPlayersNum)
              alert("Room is Full, please enter another room!");
            else if(Room.status==="In Game")
              alert("Game is already started, please enter another room!");
            else
              navigate(`/rooms/${Room.roomId}/${Room.roomName}`);
          })
          .catch(error => {
            console.error(`Something went wrong during the enterRoom: \n${error}`);
            alert(`Something went wrong during the enterRoom: \n${error}`);
          });

      }}>
        <div className="room-players">
          {Room.roomPlayersList?.map((user, index) => (
            <div className="player" key={index}>
              <i className={"twa twa-" + user.avatar} style={{fontSize: "3.8rem"}}/>
              <div className="name">{user.username}</div>
            </div>
          ))}
        </div>
        <div className="room-header">
          <div style={{fontWeight: "bold"}}>{Room.roomName}</div>
          <div>{Room.theme}</div>
          <span
            className={`room-status ${
              Room.status === "In Game" ? "in-game" : "free"
            }`}
          >
            {Room.roomProperty}
          </span>
        </div>
      </div>
    ));
  };


  return (
    <BaseContainer>
      <div className="user-container">
        <i className={"twa twa-" + user.avatar}
           onClick={toggleProfilePop}
           style={{fontSize: "3.8rem",
             marginTop:"0.8rem",
             cursor: "pointer"
        }} />
        <div className="name">{user.username}</div>
        <div className="btn-container">
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
          <Button className="reload-room-btn" onClick={
            () => fetchData().catch(error => {
              handleError(error);
              
              return;
            })
          }>
            Reload Rooms
          </Button>
        </div>
      </div>


      <Popup ref={profilePopRef} toggleDialog={toggleProfilePop} className = "profile-popup">
        <BaseContainer className="profile-popup content">
          <div className="avatar-container" onClick={() => {
            toggleAvatarPop();
            toggleProfilePop();
          }}>
            <i className={"twa twa-" + user.avatar} style={{fontSize: "10rem", marginTop:"0.8rem", textAlign:"center"}}/>
          </div>
          <div className="profile-popup field">
            <label className="profile-popup label">
              Username:
            </label>
            <input
              // className="profile-popup input"
              style={{height:"40px"}}
              placeholder={user.username}
              type="text"
              onChange={(e) => {
                const inputValue = e.target.value;  // 获取输入值
                if (inputValue.length <= MAX_USERNAME_LENGTH) {  // 检查输入值的长度
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
            <Button className="cancel" onClick={() => doEdit()
            }>
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
          {avatarList?.map((avatar,index) => (
            <div className="player" key={index} >
              <i className={"twa twa-" + avatar} style={{fontSize: "3.8rem"}} onClick={() => {
                changeAvatar(avatar).then(r => toggleAvatarPop);
                toggleAvatarPop();
              }}/>
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
          <input
            type="text"
            placeholder="Room Name"
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
              { value: "JOB", label: "JOB"},
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
          <Button className="cancel" onClick={toggleInfoPop}>
            Close
          </Button>
        </div>
      </Popup>
    </BaseContainer>
  );
};

export default Lobby;
