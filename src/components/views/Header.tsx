import React from "react";
import PropTypes from "prop-types";
import { VolumeBar } from "../ui/VolumeBar";
import "../../styles/views/Header.scss";

/**
 * This is an example of a Functional and stateless component (View) in React. Functional components are not classes and thus don't handle internal state changes.
 * Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called “props”) and return React elements describing what should appear on the screen.
 * They are reusable pieces, and think about each piece in isolation.
 * Functional components have to return always something. However, they don't need a "render()" method.
 * https://react.dev/learn/your-first-component and https://react.dev/learn/passing-props-to-a-component 
 * @FunctionalComponent
 */
const Header = props => (
  <div  className="header container" style={{left:props.left}}>
    <VolumeBar onChange={props.onChange}/>
  </div>
);

Header.propTypes = {
  left: PropTypes.string,
  onChange: PropTypes.func,
};

/**
 * Don't forget to export your component!
 */
export default Header;
