import React, {useEffect, useState, useRef} from "react";
import WaveSurfer from "wavesurfer.js";
import propTypes from "prop-types";
import { Button } from "./Button";

const WavePlayer = props => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const initializeWaveSurfer = () => {
    if (wavesurfer.current) {
      console.log(`[${props.className}]`,"WaveSurfer already initialized");
      
      return;
    }

    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#f0f0f0",
        progressColor: "#007bff",
        cursorColor: "#007bff",
        height: 100,
        barWidth: 2,
        barRadius: 3,
        normalize: true,
      });
    }

    wavesurfer.current?.on("click", ()=>{
      const duration = wavesurfer.current?.getDuration();
      if(duration===0){
        return;
      }
      // play from start
      wavesurfer.current?.seekTo(0);
      wavesurfer.current?.playPause();
      // setIsPlaying(prev => !prev);
    }
    );
        
  };

  useEffect(() => {
    initializeWaveSurfer();
  }, []);

  console.log(`[${props.className}]`, props.audioBlob);

  if (props.audioBlob) {
    console.log(`[${props.className}]`,"Loading audio blob");
    wavesurfer.current?.loadBlob(props.audioBlob);
  }

  return (
    <div className={`wave-player ${props.className}`}>
      <div ref={waveformRef}/>
      <Button onClick={() => {
        wavesurfer.current?.setPlaybackRate(0.25);
      }}
      >
                0.25x
      </Button>
    </div>
  );

}

WavePlayer.propTypes = {
  className: propTypes.string,
  audioBlob: propTypes.instanceOf(Blob),
  text: propTypes.string,
}

export default WavePlayer;


