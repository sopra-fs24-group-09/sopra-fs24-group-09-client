import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { audioBuffer2wavBlob } from "helpers/audioUtilities";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {
  LiaToggleOffSolid,
  LiaToggleOnSolid,
  LiaPlaySolid,
  LiaPauseSolid,
} from "react-icons/lia";
import { IoMdMicrophone, IoMdCheckmark } from "react-icons/io";
import "../../styles/ui/AudioRecorder.scss";

const AudioRecorder: React.FC = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioReversedBlobRef = useRef<Blob | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const recorder = useRef<RecordPlugin | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(new FFmpeg());
  const [isReversed, setIsReversed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const reverseAudioByFFmpeg = async (audioBase64: string) => {
    const ffmpeg = ffmpegRef.current;
    // check if ffmpeg is loaded
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
    try {
      await ffmpeg.writeFile(
        "audio.webm",
        new Uint8Array(
          atob(audioBase64.split(",")[1])
            .split("")
            .map((c) => c.charCodeAt(0))
        )
      );
      await ffmpeg.exec([
        "-i",
        "audio.webm",
        "-af",
        "areverse",
        "reversed.webm",
      ]);
      // audio webm to blob
      const data = await ffmpeg.readFile("reversed.webm");
      audioReversedBlobRef.current = new Blob([data], { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        localStorage.setItem("audioReversed", base64data);
      };
      reader.readAsDataURL(audioReversedBlobRef.current);
      // wavesurfer.current?.loadBlob(blob);
      console.log("reversed audio", audioReversedBlobRef.current);
    } catch (error) {
      console.error("Failed to reverse audio by FFmpeg", error);
    }
  };

  // initialize wavesurfer
  const initializeWaveSurferWithRecorder = () => {
    if (wavesurfer.current) {
      console.log("wavesurfer already initialized");
      return;
    }
    if (waveformRef.current) {
      console.log("initializeWaveSurfer");
      
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "white",
        // use classicYellow in scss file
        progressColor: "rgba(255, 204, 77, 1)",// TODO: use scss variable
        cursorColor: "red",
        height: 200,
        width: 800,
        barWidth: 6,
        cursorWidth: 6,
      });
    }

    // TODO: make it a prop parameter of the component
    const cachedAudioBase64 = localStorage.getItem("audio");
    const cachedAudioReversedBase64 = localStorage.getItem("audioReversed");
    // load cached isReversed flag as boolean
    const cachedIsReversed = localStorage.getItem("isReversed");
    if (cachedAudioBase64) {
      console.log("load cached audio");
      audioBlobRef.current = new Blob(
        [
          new Uint8Array(
            atob(cachedAudioBase64.split(",")[1])
              .split("")
              .map((c) => c.charCodeAt(0))
          ),
        ],
        { type: "audio/webm" }
      );
    }
    if (cachedAudioReversedBase64) {
      console.log("load cached reversed audio");
      audioReversedBlobRef.current = new Blob(
        [
          new Uint8Array(
            atob(cachedAudioReversedBase64.split(",")[1])
              .split("")
              .map((c) => c.charCodeAt(0))
          ),
        ],
        { type: "audio/webm" }
      );
    }
    if (cachedIsReversed) {
      const _flag = cachedIsReversed === "true";
      wavesurfer.current.loadBlob(
        _flag ? audioReversedBlobRef.current : audioBlobRef.current
      );
      setIsReversed(_flag);
      console.log("load cached isReversed", _flag);
      console.log("load cached audio", _flag ? "reversed" : "original");
    }

    recorder.current = wavesurfer.current?.registerPlugin(
      RecordPlugin.create()
    );

    // define record end behavior
    recorder.current?.on("record-end", (blob: Blob) => {
      audioBlobRef.current = blob;
      console.warn("record-end", blob);
      // save audio to local storage as encoded base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        localStorage.setItem("audio", base64data);
        reverseAudioByFFmpeg(base64data);
        // set isReverse to false
        setIsReversed(false);
        localStorage.setItem("isReversed", "false");
      };
      reader.readAsDataURL(blob);
    });

    // on finish playing
    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
    });
  };

  const onClickRecord = () => {
    // stop recording
    if (recorder.current?.isRecording()) {
      console.log("stop recording");
      recorder.current?.stopRecording();
      setIsRecording(false);

      return;
    }
    console.log("start recording");
    // get microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        recorder.current?.startRecording();
        setIsRecording(true);
      });
  };

  const onClickToggleReverse = () => {
    if (!wavesurfer.current) {
      throw new Error("wavesurfer is not initialized");
    }
    const prevIsReversed = isReversed;
    const currentIsReversed = !prevIsReversed;
    if (currentIsReversed && audioReversedBlobRef.current) {
      wavesurfer.current.loadBlob(audioReversedBlobRef.current);
      console.log("load reversed audio");
    } else if (!currentIsReversed && audioBlobRef.current) {
      wavesurfer.current.loadBlob(audioBlobRef.current);
      console.log("load original audio");
    }
    setIsReversed(currentIsReversed);
    localStorage.setItem("isReversed", currentIsReversed.toString());
  };

  // load audio
  useEffect(() => {
    initializeWaveSurferWithRecorder();
  }, []);

  return (
    <div className="audio-recorder">
      <div ref={waveformRef} className="audio-recorder wave-frame" />
      <div className="audio-recorder button-container">
        <Button
          className="audio-recorder play-button"
          disabled={isRecording}
          onClick={() => {
            // set playback rate, true for preserve pitch
            wavesurfer.current?.setPlaybackRate(playbackRate, true);
            wavesurfer.current?.playPause();
            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? <LiaPauseSolid /> : <LiaPlaySolid />}
        </Button>
        <Button
          disabled={isPlaying}
          onClick={onClickRecord}
          className="audio-recorder record-button"
        >
          {isRecording ? <IoMdCheckmark /> : <IoMdMicrophone />}
        </Button>
        <Button
          onClick={onClickToggleReverse}
          className="audio-recorder toggle-reverse-button"
          disabled={isRecording || isPlaying}
        >
          {isReversed ? <LiaToggleOnSolid /> : <LiaToggleOffSolid />}
        </Button>
        {/*List menu to select playback rate*/}
        <select
          className="audio-recorder playback-rate"
          disabled={isRecording || isPlaying}
          value={playbackRate}
          onChange={(e) => {
            setPlaybackRate(+e.target.value);
          }}
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
        </select>
      </div>
    </div>
  );
};

export default AudioRecorder;
