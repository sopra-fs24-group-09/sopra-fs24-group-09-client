import React, { useState,useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import Guide from "byte-guide";
import { PlayerList } from "./GameroomPlayerList";
import { Roundstatus } from "./GameroomRoundStatus";
import { ValidateAnswerForm } from "./GameroomAnswerForm";
import BaseContainer from "components/ui/BaseContainer";
import Header from "./Header";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import "../../styles/views/RuleGuide.scss";
import { showToast} from "../../helpers/toastService";

const mockGameTheme = "FOOD";
const mockCurrentPlayer = "id1";
const mockRoomName = "GuideRoom";
const mockGlobalVolume = 0.5;
const MS_PER_SEC = 1000;
const DEFAULT_ROUND_DURATION_S = 20;

const mockGameInfo = {
  roomID: "1",
  currentSpeaker: {
    userID: "id2",
    username: "myself",
    avatar: "dog-face"
  },
  currentAnswer: "Banana",
  roundStatus: "speak",
  currentRoundNum: 1
};
const mockSharedAudioList = {
  "id1": "fakeURL"
};

const mockPlayerLists = [
  {
    user: {
      id: "id1",
      name: "user1",
      avatar: "clown-face"
    },
    score: {
      total: 0
    },
    ifGuess: true,
    roundFinished: false,
    ready: true
  },
  {
    user: {
      id: "id2",
      name: "myself",
      avatar: "dog-face"
    },
    score: {
      total: 0
    },
    ifGuess: false,
    roundFinished: false,
    ready: true
  },
  {
    user: {
      id: "id3",
      name: "user3",
      avatar: "cat-face"
    },
    score: {
      total: 0
    },
    ifGuess: true,
    roundFinished: false,
    ready: true
  },
  {
    user: {
      id: "id4",
      name: "user4",
      avatar: "angry-face"
    },
    score: {
      total: 0
    },
    ifGuess: true,
    roundFinished: false,
    ready: true

  }
];
const gameOver = false;
const user = {
  token: "mockToken",
  id: "id2",
  username: "myself",
};
const currentSpeakerAudioURL = "fakeURL";

const RuleGuide = () => {
  useLayoutEffect(() => {
    // remove the guide key from localStorage
    if (localStorage.getItem("RuleGuide")) {
      localStorage.removeItem("RuleGuide");
    }
  }, []);
  const navigate = useNavigate();
  const roundStatusComponentRef = useRef(null);
  const [gameInfo, setGameInfo] = useState(mockGameInfo);
  const [playerInfo, setPlayerInfo] = useState(mockPlayerLists);
  const endTime = useMemo(() => new Date(Date.now() + DEFAULT_ROUND_DURATION_S * MS_PER_SEC).toISOString(), [gameInfo.roundStatus]);
  const ffmpegObj = useMemo(() => {
    const ffmpeg = new FFmpeg();
    try {
      ffmpeg.load();
    }
    catch (e) {
      console.error(e);
      alert("Failed to load ffmpeg");
    }

    return ffmpeg;
  });

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault(); // Cancel the default action
        navigate("/lobby");
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [navigate]);


  return (
    <BaseContainer className="gameroom basecontainer">
      {/* <Header left="28vw" /> */}
      <PlayerList
        currentPlayerId={mockCurrentPlayer}
        playerStatus={playerInfo}
        sharedAudioList={mockSharedAudioList}
        gameTheme={mockGameTheme}
        currentRoomName={mockRoomName}
        showReadyPopup={false}
        gameOver={false}
        globalVolume={mockGlobalVolume}
      />
      <div className="gameroom right-area">
        <Header
          onChange={
            e => {
              // setGlobalVolume(e.target.value);
              // console.log("[volume] set to", e.target.value);
            }
          }
          onClickMute={
            () => {
              // if (globalVolume === 0) {
              //     setGlobalVolume(globalVolumeBeforeMute.current);
              // } else {
              //     globalVolumeBeforeMute.current = globalVolume;
              //     setGlobalVolume(0);
              // }
            }
          }
          volume={mockGlobalVolume}
        />
        {!gameOver && (
          <Roundstatus
            gameInfo={gameInfo}
            currentSpeakerAudioURL={currentSpeakerAudioURL}
            endTime={endTime}
            ffmpegObj={ffmpegObj}
            meId={user.id}
            globalVolume={mockGlobalVolume}
            handleAudioReversed={(audio) => { }}
            ref={roundStatusComponentRef}
          />
        )}
        <div className="gameroom inputarea">
          {gameInfo.roundStatus === "guess" && (
            <div style={{ display: "flex", flexDirection: "row" }}>
              <ValidateAnswerForm
                submitAnswer={(answer) => { }}
                roundFinished={false}
              />
            </div>
          )}
          {gameInfo.roundStatus === "speak" && (
            <button className="gameroom readybutton"
              disabled={false}
              onClick={
                () => {
                  //console.log("upload audio");
                  // throttledUploadAudio();
                }
              }>upload</button>
          )}
          {gameInfo.roundStatus === "guess" && (
            <div style={{ marginTop: "1rem" }} className="gameroom readybutton" onClick={
              () => {
                //console.log("upload audio");
                // throttledUploadAudio();
              }
            }>share your audio</div>
          )}
        </div>
      </div>
      <Guide
        className="gameroom guide"
        steps={[
          {
            selector: ".roundstatus",
            title: "Speak-Phase",
            content: "Now you are the Speaker, and you need to record the word 'Banana' in the next 20 seconds",
          },
          {
            selector: ".remindermssg",
            title: "Speak-Phase",
            content: "This is where you record your audio",
          },
          {
            selector: ".record-button",
            title: "Speak-Phase",
            content: "Click here to start a recording, click again to finish, if you are not satisfied with the recording, you can click again to re-record. The maximum recording time is 5 seconds, if you exceed the time limit, the recording will be automatically stopped.",
          },
          {
            selector: ".toggle-reverse-button",
            title: "Speak-Phase",
            content: "Click here to reverse the audio, and click again to restore to the original audio",
          },
          {
            selector: ".audio-recorder.play-button",
            title: "Speak-Phase",
            content: "Click here to listen to your recording, you can also click the sound wave to listen.",
          },
          {
            // upload button
            selector: ".readybutton", // it is weird that the button is using a class name of readybutton
            title: "Speak-Phase",
            placement: "top",
            content: "Click here to submit your recording, and then all the other players will guess the word you recorded",
            beforeStepChange: () => {
              setGameInfo(
                {
                  ...gameInfo,
                  roundStatus: "guess",
                  currentSpeaker: {
                    userID: "id3",
                    username: "user3",
                    avatar: "cat-face"
                  }
                }
              );
              setPlayerInfo(
                playerInfo.map(
                  (player) => {
                    if (player.user.id === "id3") {
                      return {
                        ...player,
                        ifGuess: false
                      };
                    }
                    if (player.user.name === "myself") {
                      return {
                        ...player,
                        ifGuess: true
                      };
                    }

                    return {
                      ...player,
                    };
                  }
                )
              );
            }
          },
          {
            selector: ".roundstatus",
            title: "Guess-Phase",
            content: "Now, user3 is the Speaker, and you need to guess the word by simulating the reversed audio",
            placement: "left",
          },
          {
            selector: ".speakPlayerContainer",
            title: "Guess-Phase",
            content: "Click here to listen to the speaker's audio",
          },
          {
            selector: ".remindermssg",
            title: "Guess-Phase",
            content: "You shuold simulate the reversed audio and reverse it again to figure out the word",
            placement: "top",
          },
          {
            selector: ".inputarea",
            title: "Guess-Phase",
            content: "After you figure out the word, you can submit your answer here, also you can share your audio with others (Optional)",
            placement: "top",
          },
          {
            selector: ".btn-player",
            title: "Guess-Phase",
            content: "When someone shares their audio, you can click here to listen to their audio",
            beforeStepChange: () => {
              showToast("Congratulations! You have successfully completed the Rule Guide!\nEnjoy the game!", "success");
              navigate("/lobby");
            }
          },
        ]}
        localKey="RuleGuide"
        arrow={true}
        visible={true}
        lang="en"
        mask={true}
        step={0}
      />
    </BaseContainer>
  );
}

export default RuleGuide;