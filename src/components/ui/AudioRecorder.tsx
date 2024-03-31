import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js"
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { audioBuffer2wavBlob } from "helpers/audioUtilities";
import { FFmpeg } from "@ffmpeg/ffmpeg";


const AudioRecorder: React.FC = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioReversedBlobRef = useRef<Blob | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const recorder = useRef<RecordPlugin | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(new FFmpeg());
  const [isReversed, setIsReversed] = useState(false);

  const reverseAudioByFFmpeg = async (audioBase64: string) => {
    const ffmpeg = ffmpegRef.current;
    // check if ffmpeg is loaded
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
    try {
      await ffmpeg.writeFile("audio.webm", new Uint8Array(atob(audioBase64.split(",")[1]).split("").map(c => c.charCodeAt(0))));
      await ffmpeg.exec(["-i", "audio.webm", "-af", "areverse", "reversed.webm"]);
      // audio webm to blob
      const data = await ffmpeg.readFile("reversed.webm");
      audioReversedBlobRef.current = new Blob([data], { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        localStorage.setItem("audioReversed", base64data);
      }
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
      console.log("wavesurfer already initialized")
      
      return;
    }
    if (waveformRef.current) {
      console.log("initializeWaveSurfer")
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "violet",
        progressColor: "purple",
        cursorColor: "white",
        height: 200,
      });
    }

    // TODO: make it a prop parameter of the component
    const cachedAudioBase64 = localStorage.getItem("audio");
    const cachedAudioReversedBase64 = localStorage.getItem("audioReversed");
    // load cached isReversed flag as boolean
    const cachedIsReversed = localStorage.getItem("isReversed");
    if (cachedAudioBase64) {
      console.log("load cached audio")
      audioBlobRef.current = new Blob([new Uint8Array(atob(cachedAudioBase64.split(",")[1]).split("").map(c => c.charCodeAt(0)))], { type: "audio/webm" });
    }
    if (cachedAudioReversedBase64) {
      console.log("load cached reversed audio")
      audioReversedBlobRef.current = new Blob([new Uint8Array(atob(cachedAudioReversedBase64.split(",")[1]).split("").map(c => c.charCodeAt(0)))], { type: "audio/webm" });
    }
    if (cachedIsReversed) {
      const _flag = cachedIsReversed === "true";
      wavesurfer.current.loadBlob(_flag ? audioReversedBlobRef.current : audioBlobRef.current);
      setIsReversed(_flag);
      console.log("load cached isReversed", _flag);
      console.log("load cached audio", _flag ? "reversed" : "original");
    }


    recorder.current = wavesurfer.current?.registerPlugin(RecordPlugin.create());

    // define record end behavior
    recorder.current?.on("record-end",(blob: Blob) => {
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
      }
      reader.readAsDataURL(blob);
    });
  };

  const onClickRecord = () => {
    // stop recording
    if (recorder.current?.isRecording()) {
      console.log("stop recording")
      recorder.current?.stopRecording();
      setIsRecording(false);
      
      return;
    }
    console.log("start recording")
    // get microphone access
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
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
  }

  // load audio
  useEffect(() => {
    initializeWaveSurferWithRecorder();
  }, []);
  
  
  return (
    <div>
      <h1>Audio Recorder</h1>
      <div ref={waveformRef} style={{ width: "100%", height: "200px" }}></div>
      <Button 
        disabled={isRecording}
        onClick={() => wavesurfer.current?.playPause()}>
          Play/Pause
      </Button>
      <Button onClick={onClickRecord}>Record</Button>
      <Button onClick={onClickToggleReverse}>
        Toggle: {isReversed ? "Reversed" : "Original"}
      </Button>
    </div>
  )
};

export default AudioRecorder;