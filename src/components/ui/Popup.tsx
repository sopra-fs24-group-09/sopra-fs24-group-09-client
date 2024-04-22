import React, { forwardRef } from "react";
import { Button } from "./Button";
import "../../styles/ui/Popup.scss";

type PopupProps = {
    className?: string;
    children: React.ReactNode;
    toggleDialog: () => void;
};

const Popup = forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  return (
    <dialog ref={ref} className={`popup ${props.className}`}
      onClick={
        (e) => {
          if (e.target.tagName !== "DIALOG") {
            return;
          }
          const rect = e.target.getBoundingClientRect();
          if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            props.toggleDialog();
          }
        }
      }
      role="dialog"
      aria-hidden="true"
    >
      <div className={`popup-content ${props.className}`}>
        {props.children}
      </div>
    </dialog>
  );
});

Popup.displayName = "Popup";

export default Popup;