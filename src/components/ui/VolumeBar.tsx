import React, { useState, useRef } from "react";
import Proptypes from "prop-types";
import { Button } from "./Button";
import { IoMdVolumeOff, IoMdVolumeHigh} from "react-icons/io";
import "../../styles/ui/VolumeBar.scss";

export const VolumeBar = props => {

  return (
    <div className="volume-bar">
      {/* toggle mute or not*/}
      <Button onClick={props.onClickMute}
        className = "volume-bar toggle-mute"
      >
        {props.volume === 0 ? <IoMdVolumeOff /> : <IoMdVolumeHigh />}
      </Button>
      {/* volume slider */}
      <input
        className= "volume-bar slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={props.volume}
        // onChange={e => {
        //   setVolume(e.target.value);
        // }}
        onChange={props.onChange}
      />

    </div>
  );
}

VolumeBar.propTypes = {
  volume: Proptypes.number,
  onChange: Proptypes.func,
  onClickMute: Proptypes.func,
};


