import React, { useState, useRef } from "react";
import Proptypes from "prop-types";
import { Button } from "./Button";
import { IoMdVolumeOff, IoMdVolumeHigh} from "react-icons/io";
import "../../styles/ui/VolumeBar.scss";

export const VolumeBar = props => {
    const [volume, setVolume] = useState(props.volume);
    const volumeBeforeMute = useRef(0);
    return (
        <div className="volume-bar">
        {/* toggle mute or not*/}
        <Button onClick={() => {
            if (volume === 0) {
            setVolume(volumeBeforeMute.current);
            } else {
            volumeBeforeMute.current = volume;
            setVolume(0);
            }
        }}
        className = "volume-bar toggle-mute"
        >
            {volume === 0 ? <IoMdVolumeOff /> : <IoMdVolumeHigh />}
        </Button>
        {/* volume slider */}
        <input
            className= "volume-bar slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={e => {
            setVolume(e.target.value);
            }}
        />
    
        </div>
    );
}

VolumeBar.propTypes = {
    volume: Proptypes.number,
};


