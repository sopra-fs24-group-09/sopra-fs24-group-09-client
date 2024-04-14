/**
 * this component is a button that will play an audio file when clicked
 */
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Button } from "./Button";
import { Base64audio } from "../../types";
import { FaPause, FaPlay } from "react-icons/fa";
import "../../styles/ui/ButtonPlayer.scss";

type ButtonPlayerProps = {
  audio: Base64audio;
  className?: string;
};

export const ButtonPlayer = (props: ButtonPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [audioAvilable, setAudioAvilable] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const blob = new Blob([props.audio], { type: "audio/wav" });
    setUrl(URL.createObjectURL(blob));
    console.log(
      `[${props.className}]`,
      "ButtonPlayer loaded audioBlob",
      props.audio
    );
  }, [props.audio]);

  const playAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying((prev) => !prev);
    } else {
      // play form start
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying((prev) => !prev);
    }
  };

  // once the audio has finished playing, set isPlaying to false
  audioRef.current?.addEventListener("ended", () => {
    setIsPlaying(false);
  });

  return (
    <div className={`btn-player ${props.className}`}>
    <Button onClick={playAudio} {...props}>
      <audio ref={audioRef} src={url} />
      {!isPlaying ? <FaPlay /> : <FaPause />}
    </Button>
    </div>
  );
};
