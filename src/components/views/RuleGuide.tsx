import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerList } from "./GameroomPlayerList";
import { Roundstatus } from "./GameroomRoundStatus";
import { ValidateAnswerForm } from "./GameroomAnswerForm";
import BaseContainer from "components/ui/BaseContainer";
import Header from "./Header";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import "../../styles/views/RuleGuide.scss";
import { TourProvider, useTour } from "@reactour/tour"
import { showToast} from "../../helpers/toastService";

const mockGameTheme = "FOOD";
const mockCurrentPlayer = "id2";
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

type GuideContentDivProps = {
  children: React.ReactNode;
}
const GuideContentDiv: React.FC<GuideContentDivProps> = (props:GuideContentDivProps) => {
  return (
    <div className="guide-content">
      {props.children}
    </div>
  );
}


const RuleGuideContent = () => {
  const { isOpen, currentStep, steps, setIsOpen, setCurrentStep, setSteps } = useTour()
  // const currentSpeakerAudioURL = "fakeURL";
  const [currentSpeakerAudioURL, setCurrentSpeakerAudioURL] = useState("fakeURL");
  const [sharedAudioList, setSharedAudioList] = useState(mockSharedAudioList);
  const isRecorded = useRef(false);
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
  const step_speak_phase = [
    {
      selector: ".roundstatus",
      // title: "Guide: Speak-Phase",
      content: "Now you are the Speaker, and you need to record the word 'Banana' in the next 20 seconds",
      stepInteraction: false,
      padding: 0,
    },
    {
      selector: ".remindermssg",
      // title: "Guide: Speak-Phase",
      content: "This is where you record your audio",
      stepInteraction: false,
      padding: 0,
    },
    {
      selector: ".record-button",
      // title: "Guide: Speak-Phase",
      // content: "Click here to start a recording, click again to finish, if you are not satisfied with the recording, you can click again to re-record. The maximum recording time is 5 seconds, if you exceed the time limit, the recording will be automatically stopped.",
      content: (
        <GuideContentDiv>
          <p>Click here to start a recording, click again to finish.</p>
          <p style={{ color: "red" }}>(you must record something to continue the guide.)</p>
        </GuideContentDiv>
      ),
      // stepInteraction: false,
      padding: 0,
      disableActions: !isRecorded.current,
    },
    {
      selector: ".toggle-reverse-button",
      // title: "Guide: Speak-Phase",
      content: "Click here to reverse the audio, and click again to restore to the original audio, you can see the sound wave changes.",
      stepInteraction: isRecorded.current,
      padding: 0,
    },
    {
      selector: ".audio-recorder.play-button",
      // title: "Guide: Speak-Phase",
      content: "Click here to listen to your recording, you can also click the sound wave to listen.",
      stepInteraction: isRecorded.current,
      padding: 0,
    },
    {
      // upload button
      selector: ".readybutton", // it is weird that the button is using a class name of readybutton
      // title: "Guide: Speak-Phase",
      // placement: "top",
      position: "top",
      content: "Click here to submit your recording, and then all the other players will guess the word you recorded",
      stepInteraction: false,
      padding: 0,
    },
    {
      selector: ".roundstatus",
      // title: "Guide: Guess-Phase",
      content: "Now, user3 is the Speaker, and you need to guess the word by simulating the reversed audio",
      // placement: "left",
      position: "left",
      stepInteraction: false,
      padding: 0,
      action:() => {
        if (gameInfo.roundStatus === "speak"){
          setPlayerInfo(playerInfo.map((player) => {
            if (player.user.id === user.id) {
              return { ...player, roundFinished: false, ifGuess: true };
            }
            if (player.user.id === "id3") {
              return { ...player, ifGuess: false, roundFinished: false };
            }
            
            return player;
          }));
          setGameInfo(
            {
              ...gameInfo,
              currentSpeaker: {
                userID: "id3",
                username: "user3",
                avatar: "cat-face"
              },
              roundStatus: "guess"
            }
          );
        }
      } 
    },
    {
      selector: ".speakPlayerContainer",
      // title: "Guide: Guess-Phase",
      content: "Click here to listen to the speaker's audio",
      stepInteraction: isRecorded.current,
      padding: 0,
    },
    {
      selector: ".remindermssg",
      // title: "Guide: Guess-Phase",
      content: "You shuold simulate the reversed audio and reverse it again to figure out the word",
      stepInteraction: false,
      padding: 0,
      // placement: "top",
    },
    {
      selector: ".inputarea",
      // title: "Guide: Guess-Phase",
      content: "After you figure out the word, you can submit your answer here, also you can share your audio with others (Optional)",
      stepInteraction: false,
      padding: 0,
      // placement: "top",
    },
    {
      selector: ".btn-player",
      title: "Guide: Guess-Phase",
      content: (
        <GuideContentDiv>
          <p>When someone shares their audio, you can click here to listen to their audio</p>
          <p style={{ color: "red" }}>(You have now completed the guide, click anywhere out of this box to leave.)</p>
        </GuideContentDiv>
      ),
      // stepInteraction: false,
      padding: 0,
      actionAfter: () => {
        showToast("Congratulations! You have successfully completed the Rule Guide!\nEnjoy the game!", "success");
      }
    },
  ];

  useLayoutEffect(() => {
    setSteps(step_speak_phase);    
    setIsOpen(true);
  }, [isRecorded.current]);
  
  return (
    <BaseContainer className="gameroom basecontainer">
      {/* <Header left="28vw" /> */}
      <PlayerList
        currentPlayerId={mockCurrentPlayer}
        playerStatus={playerInfo}
        sharedAudioList={sharedAudioList}
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
            }
          }
          onClickMute={
            () => {
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
            handleAudioReversed={(audio) => {
              // make url for the reversed audio
              const TIME_DELAY = 200;
              const url = URL.createObjectURL(audio);
              isRecorded.current = true;
              setSharedAudioList({["id1"]: url });
              setCurrentSpeakerAudioURL(url);
              setTimeout(() => {
                setCurrentStep(prev => prev + 1);
              }
              , TIME_DELAY);
            }}
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
                e => {
                }
              }>upload</button>
          )}
          {gameInfo.roundStatus === "guess" && (
            <div style={{ marginTop: "1rem" }} className="gameroom readybutton" onClick={
              () => {
                //console.log("upload audio");
                // throttledUploadAudio();
              }
            }>Share Audio</div>
          )}
        </div>
      </div>
    </BaseContainer>
  );
}

const RuleGuide = () => {
  const navigate = useNavigate();
  
  return (
    <TourProvider
      className="gameroom guide"
      steps={[]}
      defaultOpen={true}
      startAt={0}
      disableDotsNavigation={true}
      showCloseButton={false}
      beforeClose={() => {
        showToast("You have left the guide page.", "info");
        navigate("/lobby");
      }}
    >
      <RuleGuideContent />
    </TourProvider>
  );
}


export default RuleGuide;