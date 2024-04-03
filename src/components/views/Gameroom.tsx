import React, {useEffect, useState} from "react";
import {api, handleError} from "helpers/api";
import {useNavigate} from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import {User} from "types";
import "styles/views/Gameroom.scss";
import "styles/twemoji-amazing.css";
import Header from "./Header";

const Gameroom = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(null);
  const [showScore, setShowScore] = useState(false)
  const [showReadyPopup, setShowReadyPopup] = useState(false)
  const [gameOver, setGameOver] = useState(false)


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

  const togglePopup = () => {
    setShowReadyPopup(prevState => !prevState);
  };

  const playerReadyStatus = [
    {
      user: {
        id: 1,
        name: "Maxwell",
        avatar: "smiling-face-with-smiling-eyes",
      },
      score: {
        total: 70,
        guess: 50,
        read: 20,
        details: [
          {"word": "Lemon","role": 1, "score": 20},
          {"word": "Apple","role": 0, "score": 30},
          {"word": "Orange","role": 0, "score": 20}
        ]
      },
      ready: true,
      ifGuess: true
    },
    {
      user: {
        id: 2,
        name: "Hanky",
        avatar: "grinning-face-with-sweat",
      },
      score: {
        total: 30,
        guess: 30,
        read: 0,
        details: [
          {"word": "Lemon","role": 0, "score": 10},
          {"word": "Apple","role": 1, "score": 0},
          {"word": "Orange","role": 0, "score": 20}
        ]
      },
      ready: true,
      ifGuess: false
    },
    {
      user: {
        id: 3,
        name: "Yang",
        avatar: "face-with-monocle",
      },
      score: {
        total: 50,
        guess: 30,
        read: 20,
        details: [
          {"word": "Lemon","role": 0, "score": 30},
          {"word": "Apple","role": 0, "score": 0},
          {"word": "Orange","role": 1, "score": 20}
        ]
      },
      ready: false,
      ifGuess: true
    },
    {
      user: {
        id: 4,
        name: "Sophia",
        avatar: "grinning-squinting-face",
      },
      score: {
        total: 60,
        guess: 0,
        read: 60,
        details: [
          {"word": "Lemon","role": 0, "score": 30},
          {"word": "Apple","role": 0, "score": 10},
          {"word": "Orange","role": 0, "score": 20}
        ]
      },
      ready: true,
      ifGuess: true
    }
  ];

  const gameInfo = {
    roomID: 5,
    currentSpeaker: {
      id: 2,
      name: "Hanky",
      avatar: "grinning-face-with-sweat",
    },
    currentAnswer: "Success",
    roundStatus: "speaks",
    currentRoundNum: 2,
  };

  const Roundstatus = ({ gameInfo }) => {
    return (
      <>
        <div className="gameroom roundstatus">
          <div className="gameroom counterdiv">
            <i className={"twa twa-stopwatch"} style={{fontSize: "2.6rem"}}/>
            <span className="gameroom counternum">50</span>
          </div>
          <div className="gameroom statusdiv">
            <div className="gameroom speakPlayerContainer" >
              {/*<img src={playerInfo.user.avatar} alt={playerInfo.user.name} />*/}
              <span className="gameroom playerAvatar">
                <i className={"twa twa-" + gameInfo.currentSpeaker.avatar} style={{fontSize: "3.8rem"}}/>
              </span>
              <div className={"gameroom secondcolumn"}>
                <div style={{flexDirection: "row"}} >
                  <span className="gameroom playerName">{gameInfo.currentSpeaker.name}</span>
                  <span className="gameroom playerName">{" "+gameInfo.roundStatus+":"}</span>
                </div>
                <i className={"twa twa-studio-microphone"} style={{position:"absolute",top:"4rem",left:"-1.1rem",fontSize: "2.2rem"}}/>
              </div>
            </div>
          </div>
        </div>
        <div className="gameroom remindermssg">
          <span className="gameroom remindertext">{"Try to simulate the reversed audio and reverse again to figure out the word!"}</span>
        </div>
      </>

    //  need to consider if the currentUser is the speaker
    );
  };

  Roundstatus.propTypes = {
    gameInfo: PropTypes.shape({
      roomID: PropTypes.number.isRequired,
      currentSpeaker: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired
      }).isRequired,
      currentAnswer: PropTypes.string.isRequired,
      roundStatus: PropTypes.string.isRequired,
      currentRoundNum: PropTypes.number.isRequired,
    }).isRequired,
  };

  const LeaderBoard = ({playerStatus}) => {
    return (
      <div className="gameroom leaderboarddiv">
        <div className="gameroom leaderboard">
          {playerStatus.map((playerInfo, index) => (
            <div className="gameroom singleScoreContainer" key={index}>
              <span className={"gameroom ranking-"+index}>{index+1}</span>
              <span className="gameroom ldPlayerAvatar">
                <i className={"twa twa-" + playerInfo.user.avatar} style={{fontSize: "2.8rem"}}/>
              </span>
              <span className="gameroom ldPlayerName">{playerInfo.user.name}</span>
              <span className="gameroom scorenum" style={{gridColumn:"3"}}>{playerInfo.score.total}</span>
              <span className="gameroom ldtitle" style={{gridColumn:"3"}} >Total</span>
              <span className="gameroom scorenum" style={{gridColumn:"4"}}>{playerInfo.score.guess}</span>
              <span className="gameroom ldtitle" style={{gridColumn:"4"}} >Guess</span>
              <span className="gameroom scorenum" style={{gridColumn:"5"}}>{playerInfo.score.read}</span>
              <span className="gameroom ldtitle" style={{gridColumn:"5"}} >Read</span>
              {playerInfo.score.details.map((detail, detailIndex) => (
                <React.Fragment key={detailIndex}>
                  <span className="gameroom scorenum" style={{gridColumn: `${detailIndex + 6}`}}>{detail.score}</span>

                  <span className="gameroom ldtitle" style={{gridColumn:`${detailIndex + 6}`}}>{detail.word}</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const PlayerList = ({playerStatus}) => {
    return (
      <>
        <div className="gameroom roominfocontainer">
          <div className={"gameroom roomifotitle"}> ROOM</div>
          <div className={"gameroom roominfo"}> #05 - Advanced</div>
        </div>
        <div className="gameroom playercontainer">
          {playerStatus.map((playerInfo, index) => (
            <div className="gameroom singlePlayerContainer" key={index}>
              {/*<img src={playerInfo.user.avatar} alt={playerInfo.user.name} />*/}
              <span className="gameroom playerAvatar">
                <i className={"twa twa-" + playerInfo.user.avatar} style={{fontSize: "3.8rem"}}/>
              </span>
              <div className={"gameroom secondcolumn"}>
                <span
                  className="gameroom playerName">{playerInfo.user.name}</span>
                <span className="gameroom secondRow">
                  <span className=" gameroom scoreTitle"> Score: </span>
                  <span className=" gameroom playerScore">{playerInfo.score.total}</span>
                  {playerInfo.ifGuess ? (
                    <i className={"twa twa-speaking-head"} style={{marginTop: "1.8rem",marginLeft:"4.4rem" ,fontSize: "2.7rem"}}/>
                  ):(
                    <i className={"twa twa-studio-microphone"} style={{marginTop: "1.8rem",marginLeft:"4rem" ,fontSize: "2.8rem"}}/>
                  )}
                </span>
              </div>
              <div className="gameroom playerStatus">
                {playerInfo.ready ? (
                  <i className="twa twa-check-mark-button" style={{fontSize: "1.5rem"}}/>
                ) : (
                  <i className="twa twa-one-thirty" style={{fontSize: "1.5rem"}}/>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  LeaderBoard.propTypes = {
    playerStatus: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          avatar: PropTypes.string.isRequired
        }).isRequired,
        score: PropTypes.shape({
          total: PropTypes.number.isRequired,
          guess: PropTypes.number.isRequired,
          read: PropTypes.number.isRequired,
          details: PropTypes.arrayOf(
            PropTypes.shape({
              word: PropTypes.string.isRequired,
              role: PropTypes.number.isRequired,
              score: PropTypes.number.isRequired
            })
          ).isRequired
        }).isRequired,
        ready: PropTypes.bool.isRequired,
        ifGuess: PropTypes.bool.isRequired
      })
    ).isRequired
  };

  PlayerList.propTypes = {
    playerStatus: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          avatar: PropTypes.string.isRequired
        }).isRequired,
        score: PropTypes.shape({
          total: PropTypes.number.isRequired,
          guess: PropTypes.number.isRequired,
          read: PropTypes.number.isRequired,
          details: PropTypes.arrayOf(
            PropTypes.shape({
              word: PropTypes.string.isRequired,
              role: PropTypes.number.isRequired,
              score: PropTypes.number.isRequired
            })
          ).isRequired
        }).isRequired,
        ready: PropTypes.bool.isRequired,
        ifGuess: PropTypes.bool.isRequired
      })
    ).isRequired
  };

  return (
    <BaseContainer>
      <Header/>
      {!gameOver && !showReadyPopup && (
        <Roundstatus gameInfo={gameInfo}/>
      )}
      <PlayerList playerStatus={playerReadyStatus}/>
      {!gameOver && showReadyPopup && (
        <div className="gameroom readypopupbg">
          <div className="gameroom readypopupcontainer">
            <span className="gameroom popuptitle"> Room#05</span>
            <span className="gameroom popuptheme"> Advanced</span>
            <span className="gameroom popuptext"> Ready to start the game?</span>
            <div className="gameroom buttonset">
              <div className="gameroom readybutton">Confirm</div>
              <div className="gameroom cancelbutton">Cancel</div>
            </div>
          </div>
        </div>
      )}
      {gameOver && (
        <LeaderBoard playerStatus={playerReadyStatus}></LeaderBoard>
      )

      }
      <div className="gameroom inputarea">
        <button onClick={togglePopup}> show </button>
        <button onClick={() => setGameOver(prevState => !prevState)}>Over</button>
      </div>
    </BaseContainer>
  );
};

export default Gameroom;
