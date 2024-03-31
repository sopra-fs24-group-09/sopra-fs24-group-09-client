import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/Dropdown.scss";

export const Dropdown = (props) => {
  return (
    <div className={`primary-dropdown ${props.className}`}
      style={props.style}
      onChange={props.onChange}>
      <select style={props.style}>
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
};

export default Dropdown;