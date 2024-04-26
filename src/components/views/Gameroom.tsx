import React, { useEffect, useState, useRef, useMemo } from "react";
import { api, handleError } from "helpers/api";
import { useNavigate, useParams } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Gameroom.scss";
import "styles/views/Header.scss";
import "styles/twemoji-amazing.css";
import Header from "./Header";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Roundstatus, RoundstatusProps} from "components/views/GameroomRoundStatus";
import { PlayerList } from "components/views/GameroomPlayerList";
import { ValidateAnswerForm } from "components/views/GameroomAnswerForm";
// Stomp related imports
import SockJS from "sockjs-client";
import { over } from "stompjs";
import type {
  Timestamped,
  PlayerAudio,
  PlayerAndRoomID,
  AnswerGuess,
  StompResponse,
  Base64audio,
} from "stomp_types";
import { v4 as uuidv4 } from "uuid";
import { getDomain } from "helpers/getDomain";

// type AudioBlobDict = { [userId: number]: Base64audio };
type SharedAudioURL = { [userId: string]: string };

const Gameroom = () => {
  const navigate = useNavigate();
  const { currentRoomID,currentRoomName } = useParams(); // get the room ID from the URL
  const stompClientRef = useRef(null);
  /**
   * Question: why we need this user state here?
   * if just for saving my id and name, we can make it a const prop
   */
  const user = {
    token: sessionStorage.getItem("token"),
    id: sessionStorage.getItem("id"),
    username: sessionStorage.getItem("username")
  };
  console.log(user)
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);
  const [currentSpeakerID, setCurrentSpeakerID] = useState(null);
  const [playerLists, setPlayerLists] = useState([]);
  const roundFinished = useRef(false);
  const [endTime, setEndTime] = useState(null);
  const gameTheme = useRef("Loading....");
  const leaderboardInfoRecieved = useRef(false);
  const [leaderboardInfo, setLeaderboardInfo] = useState([]);

  const [gameInfo, setGameInfo] = useState(null);
  const gameInfoRef = useRef(null);
  // const [roomInfo, setRoomInfo] = useState({
  //   roomID: currentRoomID,
  //   theme: "Advanced",
  // });
  const prevStatus = useRef("start");
  const [currentStatus, setCurrentStatus] = useState<
    "speak" | "guess" | "reveal"
  >("speak");
  const [sharedAudioList, setSharedAudioList] = useState<SharedAudioURL[]>([]);
  const [currentSpeakerAudioURL, setCurrentSpeakerAudioURL] = useState<
    string | null
  >(null);
  const myRecordingReversedRef = useRef<Base64audio | null>(null);
  const roundStatusComponentRef = useRef(null);

  // this ref is used to track the current speaker id in callback functions
  const currentSpeakerIdRef = useRef<number>();
  if (gameInfo && gameInfo.currentSpeaker) {
    currentSpeakerIdRef.current = gameInfo.currentSpeaker.userID;
  }
  const [globalVolume, setGlobalVolume] = useState(0.5);
  const globalVolumeBeforeMute = useRef(0);

  gameInfoRef.current = gameInfo;

  // useMemo to initialize and load FFmpeg wasm module
  // load FFmpeg wasm module
  const ffmpegObj = useMemo(() => {
    const ffmpeg = new FFmpeg();
    try {
      ffmpeg.load();
      console.log("FFmpeg module loaded");
    } catch (error) {
      console.error("Failed to load FFmpeg module", error);
      alert("Failed to load FFmpeg module");
    }

    return ffmpeg;
  }, []);

  console.log("GameInfo", gameInfo);

  useEffect(() => {
    // define subscription instances
    let playerInfoSuber;
    let gameInfoSuber;
    let sharedAudioSuber;
    let responseSuber;

    //const roomId = 5;
    const connectWebSocket = () => {
      const baseurl = getDomain();
      let Sock = new SockJS(`${baseurl}/ws/${currentRoomID}`);
      //let Sock = new SockJS('https://sopra-fs23-group-01-server.oa.r.appspot.com/ws');
      stompClientRef.current = over(Sock);
      stompClientRef.current.connect({}, onConnected, onError);
    };
    console.log(sessionStorage.getItem("id"));

    const timestamp = new Date().getTime(); // Get current timestamp

    const onConnected = () => {
      // subscribe to the topic
      playerInfoSuber = stompClientRef.current.subscribe(
        `/plays/info/${currentRoomID}`,
        onPlayerInfoReceived
      );
      gameInfoSuber = stompClientRef.current.subscribe(
        `/games/info/${currentRoomID}`,
        onGameInfoReceived
      );
      sharedAudioSuber = stompClientRef.current.subscribe(
        `/plays/audio/${currentRoomID}`,
        onShareAudioReceived
      );
      responseSuber = stompClientRef.current.subscribe(
        // `/response/${currentRoomID}`,
        `/user/${user.id}/response/${currentRoomID}`,
        onResponseReceived
      );
      enterRoom();
      //connect or reconnect
    };

    const onError = (err) => {
      console.error("WebSocket Error: ", err);
      alert("WebSocket connection error. Check console for details.");
      navigate("/lobby");
    };

    const onResponseReceived = (payload) => {
      const payloadData = JSON.parse(payload.body);
      alert("Response server side receive!"+payloadData.message)
      // TODO: handle response
      /// 1. filter the response by the receiptId
      /// 2. if the response is success, do nothing
      /// 3. if the response is failure, show the error message
      /// 4. if the response is not received, do something to handle the timeout
    };

    const onPlayerInfoReceived = (payload) => {
      const payloadData = JSON.parse(payload.body);
      setPlayerLists(payloadData.message);
      if (!showReadyPopup && !gameOver){
        const myInfo = payloadData.message.find(item => item.user.id === user.id);
        console.log("set info for myself")
        console.log(myInfo);
        if (myInfo.roundFinished !== null){
          roundFinished.current = myInfo.roundFinished;
          console.log("roundFinished?")
          console.log(roundFinished.current);
        }
      }
      if (gameOverRef.current === true && leaderboardInfoRecieved.current === false){
        setLeaderboardInfo(payloadData.message);
        leaderboardInfoRecieved.current = true;
      }
    };

    const onGameInfoReceived = (payload) => {
      // const now = new Date().getTime();
      // console.log(`[onGameInfoReceived-${now}] payload: ${payload.body}`);
      const payloadData = JSON.parse(payload.body);
      // console.error("GameInfo received", JSON.stringify(payloadData.message));
      if (JSON.stringify(gameInfoRef.current) === JSON.stringify(payloadData.message)) {
        console.log("Same game info received, ignore");
        
        return;
      }
      if (gameTheme.current !== payloadData.message.theme){
        gameTheme.current = payloadData.message.theme
      }
      // const diff = now - payloadData.timestamp;
      // console.log(`[onGameInfoReceived-${now}] diff: ${diff}`);
      if (payloadData.message.gameStatus === "ready") {
        setShowReadyPopup(true);
      } else if (payloadData.message.gameStatus === "over") {
        setShowReadyPopup(false);
        gameOverRef.current = true;
        setGameOver(true);
      } else {
        setShowReadyPopup(false);
      }

      // if currentSpeaker is not null
      if (payloadData.message.currentSpeaker) {
        setCurrentSpeakerID(payloadData.message.currentSpeaker.userID);
      }
      
      // console.log("=============================");
      // console.log("prevStatus.current", prevStatus.current);
      // console.log("payloadData.message.roundStatus", payloadData.message.roundStatus);
      if (
        prevStatus.current === "reveal" &&
        payloadData.message.roundStatus === "speak"
      ) {
        //if(payloadData.message.roundStatus === "speak"){
        //empty all the audio
        console.log("=====clear audio====");
        setCurrentSpeakerAudioURL(null);
        setSharedAudioList([]);
        roundStatusComponentRef.current?.clearAudio();
        myRecordingReversedRef.current = null;
      }
      prevStatus.current = payloadData.message.roundStatus;
      //"speak" | "guess" | "reveal" only allowed
      setEndTime(payloadData.message.roundDue);
      setCurrentStatus(payloadData.message.roundStatus);
      setGameInfo(payloadData.message);
    };

    const onShareAudioReceived = (payload) => {
      const payloadDataStamped = JSON.parse(
        payload.body
      ) as Timestamped<PlayerAudio>;
      const playerAudio = payloadDataStamped.message as PlayerAudio;
      const userId = playerAudio.userID;
      const audioData = playerAudio.audioData;
      // create URL from base64 audio data
      const blob = new Blob(
        [
          new Uint8Array(
            atob(audioData.split(",")[1])
              .split("")
              .map((c) => c.charCodeAt(0))
          ),
        ],
        { type: "audio/webm" }
      );
      const audioURL = URL.createObjectURL(blob);
      // inside the callback function, we cannot directly read a state
      // since the state is always the initial state when the callback is created
      // so we use a ref to store the current speaker id
      if (
        !!currentSpeakerIdRef.current &&
        userId === currentSpeakerIdRef.current
      ) {
        // if the audio is from the current speaker
        setCurrentSpeakerAudioURL(audioURL);
      } else {
        // if it is shared audio
        setSharedAudioList((prevState) => {
          return { ...prevState, [userId]: audioURL };
        });
      }
    };

    // const onMessageReceived = (payload) => {
    //   var payloadData = JSON.parse(payload.body);
    //   switch (payloadData.messageType) {
    //     case "PLAYERS":
    //       //jiaoyan
    //       setPlayerLists(payloadData.message);
    //       break;
    //     case "GAME":
    //       setGameInfo(payloadData.message);
    //       break;
    //     case "ROOM":
    //       setRoomInfo(payloadData.message);
    //       break;
    //     case "AUIDOSHARE":
    //       //function to deal with audio
    //       break;
    //   }
    // }


    connectWebSocket();

    // Cleanup on component unmount
    return () => {

      if (playerInfoSuber) {
        playerInfoSuber.unsubscribe();
      }
      if (gameInfoSuber) {
        gameInfoSuber.unsubscribe();
      }
      if (sharedAudioSuber) {
        sharedAudioSuber.unsubscribe();
      }
      if (responseSuber) {
        responseSuber.unsubscribe();
      }
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log("Disconnected");
        });
      }

    };
  }, []);

  //#region -----------------WebSocket Send Functions-----------------
  
  // when volume changes, apply the change to all audio players
  useEffect(() => {
    if(roundStatusComponentRef.current){
      roundStatusComponentRef.current.setVolumeTo(globalVolume);
    }
  }, [globalVolume]);

  //debounce-throttle
  const enterRoom = () => {
    const payload: Timestamped<PlayerAndRoomID> = {
      timestamp: new Date().getTime(),
      message: {
        userID: user.id,
        roomID: currentRoomID,
      },
    };
    const receiptId = uuidv4();
    stompClientRef.current?.send(
      "/app/message/users/enterroom",
      { receiptId: receiptId },
      JSON.stringify(payload)
    );
  }

  //ready
  const getReady = () => {
    const payload: Timestamped<PlayerAndRoomID> = {
      // TODO: need to make sure the timestamp is UTC format
      // and invariant to the time zone settings
      timestamp: new Date().getTime(),
      message: {
        userID: user.id,
        roomID: currentRoomID,
      },
    };
    // get a random receipt uuid
    const receiptId = uuidv4();
    stompClientRef.current?.send(
      "/app/message/users/ready",
      { receiptId: receiptId },
      JSON.stringify(payload)
    );
  };

  const cancelReady = () => {
    const payload: Timestamped<PlayerAndRoomID> = {
      // TODO: need to make sure the timestamp is UTC format
      // and invariant to the time zone settings
      timestamp: new Date().getTime(),
      message: {
        userID: user.id,
        roomID: currentRoomID,
      },
    };
    const receiptId = uuidv4();
    stompClientRef.current?.send(
      "/app/message/users/unready",
      { receiptId: receiptId },
      JSON.stringify(payload)
    );
  };

  //start game
  const startGame = () => {
    const payload: Timestamped<PlayerAndRoomID> = {
      // TODO: need to make sure the timestamp is UTC format
      // and invariant to the time zone settings
      timestamp: new Date().getTime(),
      message: {
        userID: user.id,
        roomID: currentRoomID,
      },
    };
    const receiptId = uuidv4();
    stompClientRef.current?.send(
      "/app/message/games/start",
      { receiptId: receiptId },
      JSON.stringify(payload)
    );
  };

  //exit room
  const exitRoom = () => {
    const payload: Timestamped<PlayerAndRoomID> = {
      // TODO: need to make sure the timestamp is UTC format
      // and invariant to the time zone settings
      timestamp: new Date().getTime(),
      message: {
        userID: user.id,
        roomID: currentRoomID,
      },
    };
    const receiptId = uuidv4();
    stompClientRef.current?.send(
      "/app/message/users/exitroom",
      { receiptId: receiptId },
      JSON.stringify(payload)
    );
    navigate("/lobby")
  };

  //start game
  const submitAnswer = (validateAnswer: String) => {
    const answer = validateAnswer.toLowerCase().replace(/\s/g, "");
    const payload: Timestamped<AnswerGuess> = {
      timestamp: new Date().getTime(),
      message: {
        userID: user.id,
        roomID: currentRoomID,
        guess: answer,
        roundNum: gameInfo.currentRoundNum,
        currentSpeakerID: gameInfo.currentSpeaker.userID,
      },
    };
    const receiptId = uuidv4();
    stompClientRef.current?.send(
      "/app/message/games/validate",
      { receiptId: receiptId },
      JSON.stringify(payload)
    );
  };

  //upload audio
  const uploadAudio = () => {
    console.log("[uploadAudio], myRecordingReversedRef.current", myRecordingReversedRef.current);
    if (!myRecordingReversedRef.current) {
      console.error("No audio to upload");
      
      return;
    }
    // covert the audio blob to base64 string
    const reader = new FileReader();
    reader.onload = () => {
      const base64data = reader.result as Base64audio;
      const payload: Timestamped<PlayerAudio> = {
        timestamp: new Date().getTime(),
        message: {
          userID: user.id,
          audioData:base64data,
        },
      };
      const receiptId = uuidv4();
      stompClientRef.current.send(
        "/app/message/games/audio/upload" /*URL*/,
        { receiptId: receiptId },
        JSON.stringify(payload)
      );
    };
    reader.readAsDataURL(myRecordingReversedRef.current);
  };


  //#dendregion -----------------WebSocket Send Functions-----------------

  const handleAudioReversed = useMemo(() => (audio: Blob) => {
    if (audio) {
      myRecordingReversedRef.current = audio;
      console.log("[GameRoom]Get reversed audio from AudioRecorder Success");
      console.log("Reversed Audio: ", myRecordingReversedRef.current);
    }
  }, []);

  console.log("[Gameroom]the player list is")
  console.log(playerLists);

  const LeaderBoard = ({ playerStatus }) => {
    // console.log("123456")
    console.log("[LeaderBoard]",playerStatus)
    
    return (
      <>
        {playerStatus !== null && (
          <div className="gameroom leaderboarddiv">
            <div className="gameroom leaderboard">
              {playerStatus.map((playerInfo, index) => (
                <div className="gameroom singleScoreContainer" key={index}>
                  <span className={"gameroom ranking-" + index}>{index + 1}</span>
                  <span className="gameroom ldPlayerAvatar">
                    <i
                      className={"twa twa-" + playerInfo.user.avatar}
                      style={{ fontSize: "2.8rem" }}
                    />
                  </span>
                  <span className="gameroom ldPlayerName">
                    {playerInfo.user.name}
                  </span>
                  <span className="gameroom scorenum" style={{ gridColumn: "3" }}>
                    {playerInfo.score.total}
                  </span>
                  <span className="gameroom ldtitle" style={{ gridColumn: "3" }}>
                Total
                  </span>
                  <span className="gameroom scorenum" style={{ gridColumn: "4" }}>
                    {playerInfo.score.guess}
                  </span>
                  <span className="gameroom ldtitle" style={{ gridColumn: "4" }}>
                Guess
                  </span>
                  <span className="gameroom scorenum" style={{ gridColumn: "5" }}>
                    {playerInfo.score.read}
                  </span>
                  <span className="gameroom ldtitle" style={{ gridColumn: "5" }}>
                Read
                  </span>
                  {playerInfo.score.details.map((detail, detailIndex) => (
                    <React.Fragment key={detailIndex}>
                      <span
                        className="gameroom scorenum"
                        style={{ gridColumn: `${detailIndex + 6}` }}
                      >
                        {detail.score}
                      </span>

                      <span
                        className="gameroom ldtitle"
                        style={{ gridColumn: `${detailIndex + 6}` }}
                      >
                        {detail.word}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  LeaderBoard.propTypes = {
    playerStatus: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          avatar: PropTypes.string.isRequired,
        }).isRequired,
        score: PropTypes.shape({
          total: PropTypes.number.isRequired,
          guess: PropTypes.number.isRequired,
          read: PropTypes.number.isRequired,
          details: PropTypes.arrayOf(
            PropTypes.shape({
              word: PropTypes.string.isRequired,
              role: PropTypes.number.isRequired,
              score: PropTypes.number.isRequired,
            })
          ).isRequired,
        }).isRequired,
        ready: PropTypes.bool.isRequired,
        ifGuess: PropTypes.bool.isRequired,
      })
    ).isRequired,
  };


  if (playerLists === null) {
    return <div>Loading...</div>;
  }

  return (
    <BaseContainer className="gameroom basecontainer">
      {/* <Header left="28vw" /> */}
      <PlayerList
        playerStatus={playerLists}
        sharedAudioList={sharedAudioList}
        gameTheme={gameTheme.current}
        currentRoomName={currentRoomName}
        showReadyPopup={showReadyPopup}
        gameOver={gameOver}
        globalVolume={globalVolume}
      />
      <div className="gameroom right-area">
        <Header 
          onChange={
            e => {
              setGlobalVolume(e.target.value);
              console.log("[volume] set to", e.target.value);
            }
          }
          onClickMute={
            () => {
              if (globalVolume === 0) {
                setGlobalVolume(globalVolumeBeforeMute.current);
              } else {
                globalVolumeBeforeMute.current = globalVolume;
                setGlobalVolume(0);
              }
            }
          }
          volume={globalVolume}
        />
        {!gameOver && showReadyPopup && (
          <div className="gameroom readypopupbg">
            <div className="gameroom readypopupcontainer">
              <span className="gameroom popuptitle"> {"Room#" + currentRoomName}</span>
              <span className="gameroom popuptheme">{gameTheme.current}</span>
              <span className="gameroom popuptext">
                {" "}
                Ready to start the game?
              </span>
              <div className="gameroom buttonset">
                {gameInfo.roomOwner.id === user.id &&(
                  <>
                    <div
                      className="gameroom readybutton"
                      onClick={() => startGame()}
                      //onKeyDown={() => getReady()}
                    >
                      Start
                    </div>
                    <div
                      className="gameroom cancelbutton"
                      onClick={() => exitRoom()}
                    >
                      Quit
                    </div>
                  </>
                )}
                {gameInfo.roomOwner.id !== user.id &&(
                  <>
                    <div
                      className="gameroom readybutton"
                      onClick={() => getReady()}
                      onKeyDown={() => getReady()}
                    >
                      Confirm
                    </div>
                    <div
                      className="gameroom cancelbutton"
                      onClick={() => cancelReady()}
                      onKeyDown={() => cancelReady()}
                    >
                      Cancel
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {gameOver && (
          <LeaderBoard playerStatus={leaderboardInfo}></LeaderBoard>
        )}
        {!gameOver && !showReadyPopup && (
          <Roundstatus
            gameInfo = {gameInfo}
            currentSpeakerAudioURL={currentSpeakerAudioURL}
            endTime = {endTime}
            ffmpegObj = {ffmpegObj}
            meId = {user.id}
            globalVolume = {globalVolume}
            handleAudioReversed = {handleAudioReversed}
            ref={roundStatusComponentRef}
          />
        )}
        <div className="gameroom inputarea">
          { gameInfo !== null &&
            !gameOver &&
            !showReadyPopup &&
            gameInfo.currentSpeaker.userID !== user.id &&
            currentStatus === "guess" && (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <ValidateAnswerForm 
                submitAnswer={submitAnswer}
                roundFinished={roundFinished.current}  
              />
            </div>
          )}
          <div style={{display:"flex",flexDirection:"row"}}>
            {showReadyPopup === true &&(
              // {showReadyPopup === true && user.id !== gameInfo.roomOwner.id &&(
              <div className="gameroom cancelbutton" onClick={
                () => {
                  console.log("leave room");
                  exitRoom();
                }
              }>leave</div>
            )}
            {gameOver === true &&(
              <div className="gameroom cancelbutton" onClick={
                () => {
                  console.log("leave room after over");
                  exitRoom();
                  // navigate("/lobby");
                }
              }>leave</div>
            )}
            {currentSpeakerID === user.id &&
              currentStatus === "speak" && (
              <button className="gameroom readybutton"
                disabled={roundFinished.current}
                onClick={
                  () => {
                    console.log("upload audio");
                    uploadAudio();
                  }
                }>upload</button>
            )}
            {currentSpeakerID !== user.id &&
              currentStatus === "guess" && (
              <div style={{marginTop:"1rem"}} className="gameroom readybutton" onClick={
                () => {
                  console.log("upload audio");
                  uploadAudio();
                }
              }>share your audio</div>
            )}
          </div>

        </div>
      </div>
    </BaseContainer>
  );
};

export default Gameroom;
