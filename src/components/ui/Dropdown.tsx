import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/Dropdown.scss";

export const Dropdown = (props) => {
  return (
    <div className={`primary-dropdown ${props.className}`}
      style={props.style}>
      <select 
        disabled={props.disabled}
        style={props.style}
        onChange={props.onChange}
        defaultValue={props.defaultValue}>
        {props.prompt && <option hidden disabled selected value>{props.prompt}</option>}
        {props.options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

Dropdown.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  style: PropTypes.string,
  className: PropTypes.string,
  defaultValue: PropTypes.number,
  disabled: PropTypes.bool,
  prompt: PropTypes.string,
};

export default Dropdown;