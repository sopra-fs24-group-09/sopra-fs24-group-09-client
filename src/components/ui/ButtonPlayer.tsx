/**
 * this component is a button that will play an audio file when clicked
 */
import React, { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button } from "./Button";
import { FaPause, FaPlay } from "react-icons/fa";
import "../../styles/ui/ButtonPlayer.scss";

type ButtonPlayerProps = {
  audioURL: string;
  className?: string;
};

export const ButtonPlayer = (props: ButtonPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

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

  // useEffect to add event listener to audio element
  useEffect(() => {
    // check if the audio file is available
    // if the audio file is available add event listener
    const audio = audioRef.current;
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    return () => {
      audio.removeEventListener("ended", () => {
        setIsPlaying(false);
      });
    };
  }, []);

  return (
    <div className={`btn-player ${props.className}`}>
      <Button onClick={playAudio}>
        <audio ref={audioRef} src={props.audioURL} />
        {!isPlaying ? <FaPlay /> : <FaPause />}
      </Button>
    </div>
  );
};
