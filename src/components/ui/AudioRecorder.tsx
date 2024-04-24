import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import React, { useLayoutEffect , useRef, useState , useEffect, useImperativeHandle } from "react";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { FaPause, FaPlay } from "react-icons/fa";
import { GiClockwiseRotation, GiAnticlockwiseRotation } from "react-icons/gi";
import { IoMdMicrophone, IoMdCheckmark } from "react-icons/io";
import "../../styles/ui/AudioRecorder.scss";
import PropType from "prop-types";
import { Base64audio } from "types";


export const AudioRecorder = React.forwardRef((props,ref) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioReversedBlobRef = useRef<Blob | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const recorder = useRef<RecordPlugin | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState<Boolean>(false);
  // const ffmpegRef = useRef<FFmpeg | null>(new FFmpeg());
  const [isReversed, setIsReversed] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<Number>(1);
  const [waveAvailable, setWaveAvailable] = useState(false);
  const cachedName = `${props.audioName}_original`;
  const cachedReversedName = `${props.audioName}_reversed`;
  const cachedIsReversedName = `${props.audioName}_isReversed`;

  // compress audio by FFmpeg
  const compressAudioByFFmpegAndCacheIt = async (audioBase64: Base64audio) => {
    // const ffmpeg = ffmpegRef.current;
    const ffmpeg = props.ffmpeg;
    // check if ffmpeg is loaded
    if (!ffmpeg.loaded) {
      try {
        await ffmpeg.load();
      } catch (error) {
        console.error("Failed to load FFmpeg", error);
        alert("Failed to load FFmpeg, your browser may not support it.");
        
        return;
      }
    }
    try {
      await ffmpeg.writeFile(
        "input.webm",
        new Uint8Array(
          atob(audioBase64.split(",")[1])
            .split("")
            .map((c) => c.charCodeAt(0))
        )
      );
      await ffmpeg.exec([
        "-i",
        "input.webm",
        "-c:a",
        "libopus",
        "-b:a",
        "16k",
        "compressed.webm",
      ]);
      // audio webm to blob
      const data = await ffmpeg.readFile("compressed.webm");
      const blob = new Blob([data], { type: "audio/webm" });
      wavesurfer.current?.loadBlob(blob);
      console.log(`[${props.audioName}]`,"compressed audio", blob);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as Base64audio;
        sessionStorage.setItem(cachedName, base64data);
      }
      reader.readAsDataURL(blob);
      // clean ffmpeg files
      await ffmpeg.deleteFile("input.webm");
      await ffmpeg.deleteFile("compressed.webm");
    } catch (error) {
      console.error("Failed to compress audio by FFmpeg", error);
    }
  }

  const reverseAudioByFFmpegAndCacheIt = async (audioBase64: Base64audio) => {
    // const ffmpeg = ffmpegRef.current;
    const ffmpeg = props.ffmpeg;
    // check if ffmpeg is loaded
    if (!ffmpeg.loaded) {
      try {
        await ffmpeg.load();
      } catch (error) {
        console.error("Failed to load FFmpeg", error);
        alert("Failed to load FFmpeg, your browser may not support it.");
        
        return;
      }
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
        "-c:a",
        "libopus",
        "-b:a",
        "16k",
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
        sessionStorage.setItem(cachedReversedName, base64data);
      };
      reader.readAsDataURL(audioReversedBlobRef.current);
      // wavesurfer.current?.loadBlob(blob);
      console.log(`[${props.audioName}]`,"reversed audio", audioReversedBlobRef.current);
      // clean ffmpeg files
      await ffmpeg.deleteFile("audio.webm");
      await ffmpeg.deleteFile("reversed.webm");
    } catch (error) {
      console.error("Failed to reverse audio by FFmpeg", error);
    }
  };
  
  const loadCachedAudio = () => {
    // TODO: make it a prop parameter of the component
    const cachedAudioBase64 = sessionStorage.getItem(cachedName);
    const cachedAudioReversedBase64 = sessionStorage.getItem(cachedReversedName);
    // load cached isReversed flag as boolean
    const cachedIsReversed = sessionStorage.getItem(cachedIsReversedName);
    if (cachedAudioBase64) {
      console.log(`[${props.audioName}]`,"load cached audio");
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
      console.log(`[${props.audioName}]`,"load cached reversed audio");
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
    if (cachedIsReversed
    ) {
      const _flag = cachedIsReversed === "true";
      if(_flag && audioReversedBlobRef.current){
        wavesurfer.current.loadBlob(audioReversedBlobRef.current);
      }else if(!_flag && audioBlobRef.current){
        wavesurfer.current.loadBlob(audioBlobRef.current);
      }else{
        console.log("Failed to load cached audio");
      }
      setIsReversed(_flag);
      console.log(`[${props.audioName}]`,"load cached isReversed", _flag);
      console.log(`[${props.audioName}]`,"load cached audio", _flag ? "reversed" : "original");
    }
  }
 
  // initialize wavesurfer
  const initializeWaveSurferWithRecorder = () => {
    if (wavesurfer.current) {
      console.log(`[${props.audioName}]`,"wavesurfer already initialized");
      
      return;
    }
    if (waveformRef.current) {
      console.log(`[${props.audioName}]`,"initializeWaveSurfer");

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "white",
        // use classicYellow in scss file
        progressColor: "rgba(255, 204, 77, 1)", // TODO: use scss variable
        cursorColor: "red",
        cursorWidth: 3,
        height: 100,
        barWidth: 6,
      });
    }

    recorder.current = wavesurfer.current?.registerPlugin(
      RecordPlugin.create({
        // mimeType: "audio/webm",
      })
    );

    // define record end behavior
    recorder.current?.on("record-end", (blob: Blob) => {
      audioBlobRef.current = blob;
      console.warn("record-end", blob);
      // save audio to local storage as encoded base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as Base64audio;
        sessionStorage.setItem(cachedName, base64data);
        reverseAudioByFFmpegAndCacheIt(base64data);
        compressAudioByFFmpegAndCacheIt(base64data);
        console.log(`[${props.audioName}]`,"save audio to local storage");
        // set isReverse to false
        setIsReversed(false);
        sessionStorage.setItem(cachedIsReversedName, "false");
      };
      reader.readAsDataURL(blob);
    });

    // on finish playing
    wavesurfer.current?.on("finish", () => {
      setIsPlaying(false);
    });

    wavesurfer.current?.on("click", () => {
      const duration = wavesurfer.current?.getDuration();
      // console.log(`[${props.audioName}]`,"click", duration);
      // Since wavesurfer.empty() will cause duration to be 0.001, we need to check if duration is smaller than 0.0011
      if (duration < 0.0011) {
        return;
      }
      wavesurfer.current?.playPause();
      // setIsPlaying(!isPlaying); this is not working since it's async, and isPlaying is always false with it's initial value
      setIsPlaying(prev => !prev);// toggle isPlaying
    });

    wavesurfer.current?.on("ready", () => {
      setWaveAvailable(true);
    });
  };

  const onClickRecord = () => {
    // stop recording
    if (recorder.current?.isRecording()) {
      console.log(`[${props.audioName}]`,"stop recording");
      recorder.current?.stopRecording();
      setIsRecording(false);

      return;
    }
    console.log(`[${props.audioName}]`,"start recording");
    // get microphone access
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        recorder.current?.startRecording();
        setIsRecording(true);
      });
    // once recording is started, enable interaction
    // should be placed in onRecordEnd event, but it's not working
    wavesurfer.current?.toggleInteraction(true);
  };

  const onClickToggleReverse = () => {
    if (!wavesurfer.current) {
      throw new Error("wavesurfer is not initialized");
    }
    const prevIsReversed = isReversed;
    const currentIsReversed = !prevIsReversed;
    if (currentIsReversed && audioReversedBlobRef.current) {
      wavesurfer.current.loadBlob(audioReversedBlobRef.current);
      console.log(`[${props.audioName}]`,"load reversed audio");
    } else if (!currentIsReversed && audioBlobRef.current) {
      wavesurfer.current.loadBlob(audioBlobRef.current);
      console.log(`[${props.audioName}]`,"load original audio");
    }
    setIsReversed(currentIsReversed);
    sessionStorage.setItem(cachedIsReversedName, currentIsReversed.toString());
  };

  // load audio, layoutEffect is used to make sure the wavesurfer is initialized before loading audio
  useLayoutEffect(() => {
    initializeWaveSurferWithRecorder();
    loadCachedAudio();
    
    return () => {
      // // clean up wavesurfer
      // if (wavesurfer.current) {
      //   wavesurfer.current.destroy();
      //   console.log(`[${props.audioName}]`,"destroy wavesurfer");
      // }
    }
  }, []);

  ///
  /// clear wavesurwave and cached audio
  /// called by parent component
  ///
  const clearAudio = () => {
    if (wavesurfer.current) {
      // wavesurfer.current.empty();
      wavesurfer.current.empty();
      wavesurfer.current.toggleInteraction(false);
      setWaveAvailable(false);
      console.log(`[${props.audioName}]`,"clear audio");
    }
    audioBlobRef.current = null;
    audioReversedBlobRef.current = null;
    sessionStorage.removeItem(cachedName);
    sessionStorage.removeItem(cachedReversedName);
    sessionStorage.removeItem(cachedIsReversedName);
    console.log(`[${props.audioName}]`,"clear cached audio");
  };

  useImperativeHandle(ref, () => ({
    clearAudio: clearAudio,
    setVolume: (volume: number) => {
      wavesurfer.current?.setVolume(volume);
      console.log(`[${props.audioName}]`,"set volume to", volume);
    }
  }),[]);

  // pass reversed audio to parent component
  useEffect(() => {
    props.handleReversedAudioChange && props.handleReversedAudioChange(audioReversedBlobRef.current);
    console.log(`[${props.audioName}]`,"reversed audio changed", audioReversedBlobRef.current);
  }, [audioReversedBlobRef.current]);

  return (
    <div className={`audio-recorder ${props.className}`}>
      <div ref={waveformRef} className="audio-recorder wave-frame" />
      <div className="audio-recorder button-container">
        <Button
          className="audio-recorder play-button"
          disabled={isRecording || !waveAvailable || props.disabled}
          onClick={() => {
            wavesurfer.current?.setPlaybackRate(playbackRate, true);
            wavesurfer.current?.playPause();
            setIsPlaying(prev => !prev);
          }}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </Button>
        <Button
          disabled={isPlaying || props.disabled}
          onClick={onClickRecord}
          className="audio-recorder record-button"
        >
          {isRecording ? <IoMdCheckmark /> : <IoMdMicrophone />}
        </Button>
        <Button
          onClick={onClickToggleReverse}
          className="audio-recorder toggle-reverse-button"
          disabled={isRecording || isPlaying || props.disabled || !waveAvailable}
        >
          {isReversed ? <GiClockwiseRotation /> : <GiAnticlockwiseRotation />}
        </Button>
        {/*List menu to select playback rate*/}
        <Dropdown
          disabled = {props.disabled || !waveAvailable}
          className="audio-recorder button-container playback-rate-dropdown"
          onChange={(e) => {
            const rate = parseFloat(e.target.value);
            setPlaybackRate(rate);
            wavesurfer.current?.setPlaybackRate(rate, true);
          }}
          defaultValue={playbackRate}
          options={[
            { value: 0.5, label: "0.5x" },
            { value: 0.75, label: "0.75x" },
            { value: 1, label: "1x" },
          ]}
        />
      </div>
    </div>
  );
});

AudioRecorder.propTypes = {
  className: PropType.string,
  audioName: PropType.string.isRequired,
  ffmpeg: PropType.object.isRequired,
  disabled: PropType.bool,
  handleReversedAudioChange: PropType.func,
};

AudioRecorder.displayName = "AudioRecorder";


export default AudioRecorder;
