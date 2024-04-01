import React, { useRef, useEffect, useState} from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Lobby.scss";
import { User, Room } from "types";
import Popup from "components/ui/Popup";
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
    <img src={"https://twemoji.maxcdn.com/v/latest/72x72/1f604.png"} alt={user.username} className="player-avatar" />
    <div className="player-username">{user.username}</div>
  </div>
);
const RoomComponent: React.FC<RoomComponentProps> = ({ room }) => (
  <div className="room">
    <div className="room-header">
      {room.roomPlayersList.map(user => (
        <Player key={user.id} user={user} />
      ))}
    </div>
    <div className="room-footer">
      <div className="room-theme">{room.theme}</div>
      <div className="room-status" style={{ color: room.status === "In Game" ? "orange" : "green" }}>
        {room.status}
      </div>
    </div>
  </div>
);
const RoomList: React.FC<RoomListProps> = ({ rooms }) =>  (
  <div className="room-list">
    {rooms.map(room => (
      <RoomComponent key={room.id} room={room} />
    ))}
  </div>
);

Player.propTypes = {
  user: PropTypes.object,
};

const mockRoomPlayers: User[] = [
  { id: 1, username: "Alice", avatar: "https://twemoji.maxcdn.com/v/latest/72x72/1f604.png", name: "Alice Wonderland", status: "ONLINE", registerDate: new Date("2021-08-01"), birthday: new Date("1990-01-01") },
  { id: 2, username: "Bob", avatar: "https://twemoji.maxcdn.com/v/latest/72x72/1f602.png", name: "Bob Builder", status: "OFFLINE", registerDate: new Date("2021-09-01"), birthday: new Date("1985-02-02") },
];

const mockRooms: Room[] = [
  {
    id: "1",
    roomOwnerId: "1",
    roomPlayersList: [mockRoomPlayers[0]],
    theme: "Advanced",
    status: "In Game",
    maxPlayersNum: 4,
    alivePlayersList: [mockRoomPlayers[0]],
    currentPlayerIndex: 0,
    playToOuted: false,
  },
  {
    id: "2",
    roomOwnerId: "2",
    roomPlayersList: [mockRoomPlayers[1]],
    theme: "Food",
    status: "Free",
    maxPlayersNum: 4,
    alivePlayersList: [mockRoomPlayers[1]],
    currentPlayerIndex: 1,
    playToOuted: false,
  }
];


const Lobby = () => {
  const navigate = useNavigate();
  const roomCreationPopRef = useRef<HTMLDialogElement>(null);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [user, setUser] = useState<User[]>(mockRoomPlayers[0]);
  const logout = async () => {
    const id = localStorage.getItem("id");
    localStorage.removeItem("token");
    //apply a post request for user logout
    try {
      const requestBody = JSON.stringify({id:id});
      const response = await api.post("/users/logout", requestBody);
      console.log(response);

    } catch (error) {
      alert(`Something went wrong during the logout: \n${handleError(error)}`);
    }
    navigate("/login");
  };


  // useEffect(() => {
  //    async function fetchData() {
  //     try {
  //       //get all rooms
  //       const response = await api.get("/games/lobby");
  //       await new Promise((resolve) => setTimeout(resolve, 1000));
  //       setRooms(response.data);
  //
  //       console.log("request to:", response.request.responseURL);
  //       console.log("status code:", response.status);
  //       console.log("status text:", response.statusText);
  //       console.log("requested data:", response.data);
  //
  //       // See here to get more data.
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
  //
  //   fetchData();
  // }, []);

  const toggleRoomCreationPop = () => {
    // if the ref is not set, do nothing
    if(!roomCreationPopRef.current){
      return;
    }
    // if the dialog is open, close it. Otherwise, open it.
    roomCreationPopRef.current.hasAttribute("open") 
      ? roomCreationPopRef.current.close() 
      : roomCreationPopRef.current.showModal();
  }

  const userinfo = () =>{
    return
  }
  const renderRoomLists = () => {
    return mockRooms.map(room => (
      <div className="room-container" key={room.id}>
        <div className="room-players">
          {room.roomPlayersList?.map((user, index) => (
            <div className="player" key={index}>
              <img src={user.avatar} alt={user.name} className="player-avatar" />
              <div className="name">{user.username}</div>
            </div>
          ))}
        </div>
        <div className="room-header">
          ROOM #{room.id}
          <div>{room.theme}</div>

          <span className={`room-status ${room.status === "In Game" ? "in-game" : "free"}`}>
            {room.status}
          </span>

        </div>
      </div>
    ));
  };
  
  return (

    <BaseContainer>

      <div className="user-container">
        <img src={user.avatar} alt={user.name} className="player-avatar" />
        <div className="name">{user.username}</div>
      </div>
      <div className="big-title">
        Kaeps
      </div>
      <div className='information'> i </div>
      <div className="lobby room-list-wrapper">
        {/* for clip the scrollbar inside the border */}
        <div className="lobby room-list">
          <h1>Rooms</h1>
          {renderRoomLists()}
          <div className="lobby room-list btn-container">        
            <Button className="create-room-btn" onClick={toggleRoomCreationPop}>
            New Room
            </Button>
          </div>
        </div>
      </div>
      
      <Popup ref={roomCreationPopRef}
        toggleDialog={toggleRoomCreationPop}
        className="room-creation-popup">
        <BaseContainer className="room-creation-popup content">
          <input type="text" placeholder="Room Name" />
          <input type="number" placeholder="Max Players" />
          <div className="room-creation-popup btn-container">
            <Button className="create-room">Create Room</Button>
            <Button className="cancel" onClick={toggleRoomCreationPop}>Cancel</Button>
          </div>
        </BaseContainer>
      </Popup>


    </BaseContainer>
  );
};

export default Lobby;
