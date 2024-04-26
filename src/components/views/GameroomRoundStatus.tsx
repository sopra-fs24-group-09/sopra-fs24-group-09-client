import React, { useRef, useImperativeHandle } from "react";
import { CounterDown } from "components/ui/CounterDown";
import { WavePlayer } from "components/ui/WavePlayer";
import { AudioRecorder } from "components/ui/AudioRecorder";

export type RoundstatusProps = {
    gameInfo: {
        roomID: string;
        currentSpeaker: {
        userID: string;
        username: string;
        avatar: string;
        };
        currentAnswer: string;
        roundStatus: string;
        currentRoundNum: number;
    };
    currentSpeakerAudioURL: string;
    endTime: string;
    ffmpegObj: object;
    meId: string;
    globalVolume: number;
    handleAudioReversed: (audio:Blob) => void;
};

export const Roundstatus : React.ForwardRefRenderFunction<RoundstatusProps, any> = React.forwardRef((props:RoundstatusProps,ref) => {
  const { gameInfo, currentSpeakerAudioURL,endTime,meId,ffmpegObj,globalVolume,handleAudioReversed } = props;
  console.log("gameInfo", gameInfo);
  const _audioRecorderRef = useRef(null);
  const _wavePlayerRef = useRef(null);
  useImperativeHandle(ref, () => ({
    clearAudio: () => {
      console.log("----clear audio");
      _audioRecorderRef.current?.clearAudio();
    },
    setVolumeTo: (volume) => {
      console.log("----set volume to", volume);
      _audioRecorderRef.current?.setVolume(volume);
      _wavePlayerRef.current?.setVolume(volume);
    }
  }), []);
    
  if (!gameInfo) {
    return <div>loading...</div>;
  }
    
  return (
    <>
      <div className="gameroom roundstatus">
        <CounterDown endTimeString={endTime}/>
        <div className="gameroom statusdiv">
          <div className="gameroom speakPlayerContainer">
            {/*<img src={playerInfo.user.avatar} alt={playerInfo.user.name} />*/}
            <span className="gameroom playerAvatar">
              <i
                className={"twa twa-" + gameInfo.currentSpeaker.avatar}
                style={{ fontSize: "3.8rem" }}
              />
              <i
                className={"twa twa-studio-microphone"}
                style={{ fontSize: "2.2rem" }}
              />
            </span>
            {gameInfo.currentSpeaker.userID === meId &&
                gameInfo.roundStatus === "speak" && (
              <>
                <div className={"gameroom secondcolumn"}>
                  <div
                    className="gameroom speakerName"
                    style={{ flexDirection: "row" }}
                  >
                    <span className="gameroom playerName">
                      {"Round " + gameInfo.currentRoundNum + " "}
                    </span>
                    <span className="gameroom playerName">
                      {gameInfo.currentSpeaker.username + ", please"}
                    </span>
                    <span className="gameroom playerName">
                      {" record:"}
                    </span>
                  </div>
                  <span className="gameroom currentAnswer">
                    {gameInfo.currentAnswer}
                  </span>
                </div>
              </>
            )}
            {gameInfo.currentSpeaker.userID !== meId &&
                gameInfo.roundStatus === "speak" && (
              <>
                <div className={"gameroom secondcolumn"}>
                  <div
                    className="gameroom speakerName"
                    style={{ flexDirection: "row" }}
                  >
                    <span className="gameroom playerName">
                      {"Round " + gameInfo.currentRoundNum + " "}
                    </span>
                    <span className="gameroom playerName">
                      {gameInfo.currentSpeaker.username + "'s'"}
                    </span>
                    <span className="gameroom playerName">
                      {"turn to record"}
                    </span>
                  </div>
                  {/*<span className="gameroom currentAnswer">{gameInfo.currentAnswer}</span>*/}
                </div>
              </>
            )}
            {gameInfo.roundStatus === "guess" && (
              <>
                <div className={"gameroom secondcolumn"}>
                  <div
                    className="gameroom speakerName"
                    style={{ flexDirection: "row" }}
                  >
                    <span className="gameroom playerName">
                      {gameInfo.currentSpeaker.userID === meId ? 
                        "Your revesed audio:" :
                        gameInfo.currentSpeaker.username + "'s revesed audio:"}
                    </span>
                  </div>
                  <WavePlayer
                    key="waveplayer"
                    ref={_wavePlayerRef}
                    className="gameroom waveplayer"
                    audioURL={currentSpeakerAudioURL}
                  />
                </div>
              </>
            )}
            {gameInfo.roundStatus === "reveal" && (
              <>
                <div className={"gameroom secondcolumn"}>
                  <div
                    className="gameroom speakerName"
                    style={{ flexDirection: "row" }}
                  >
                    <span className="gameroom playerName">
                      {"The word " +
                          gameInfo.currentSpeaker.username +
                          " recorded is "}
                    </span>
                    <span className="gameroom revealAnswer">
                      {" "}
                      {gameInfo.currentAnswer}
                    </span>
                  </div>
                  {/*<WavePlayer*/}
                  {/*  className="gameroom waveplayer"*/}
                  {/*  audioURL={currentSpeakerAudioURL}*/}
                  {/*  volume={globalVolume}*/}
                  {/*/>*/}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="gameroom remindermssg">
          {gameInfo.currentSpeaker.userID === meId &&
              gameInfo.roundStatus === "speak" && (
            <span className="gameroom remindertext">
              {"Try to read and record the word steadily and loudly!"}
            </span>
          )}
          {gameInfo.currentSpeaker.userID !== meId &&
              gameInfo.roundStatus === "speak" && (
            <span className="gameroom remindertext">
              {
                "Please wait until the speak player finishes recording and uploading!"
              }
            </span>
          )}
          {gameInfo.currentSpeaker.userID !== meId &&
              gameInfo.roundStatus === "guess" && (
            <span className="gameroom remindertext">
              {
                "Try to simulate the reversed audio and reverse again to figure out the word!"
              }
            </span>
          )}
          {gameInfo.currentSpeaker.userID === meId &&
              gameInfo.roundStatus === "guess" && (
            <span className="gameroom remindertext">
              {
                "You can try to simulate the reversed audio or listen to others' audio!"
              }
            </span>
          )}
          {gameInfo.roundStatus === "reveal" && (
            <span className="gameroom remindertext">
              {"Time is up and now reveals the answer!"}
            </span>
          )}
          <AudioRecorder
            key="audiorecorder"
            ref={_audioRecorderRef}
            className="gameroom audiorecorder"
            ffmpeg={ffmpegObj}
            audioName={"my_recording"}
            // handleReversedAudioChange={handleAudioReversed}
            handleReversedAudioChange={handleAudioReversed}
            disabled={
              (gameInfo.currentSpeaker.userID !== meId && gameInfo.roundStatus === "speak") ||
                gameInfo.roundStatus === "reveal"
            }
          />
        </div>
      </div>
    </>
  );
});
Roundstatus.displayName = "Roundstatus";
