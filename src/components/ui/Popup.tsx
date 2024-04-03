import React, { forwardRef } from "react";
import { Button } from "./Button";

type PopupProps = {
    children: React.ReactNode;
    toggleDialog: () => void;
};

const Popup = forwardRef<HTMLDivElement, PopupProps>((props, ref) => {
  return (
    <dialog ref={ref} className="popup"
      onClick={
        (e) => {
          if (e.target === e.currentTarget) {
            props.toggleDialog();
          }
        }
      }
    >
      <div>
        {props.children}
        <Button onClick={props.toggleDialog}>Close</Button>
      </div>
    </dialog>
  );
});

Popup.displayName = "Popup";

export default Popup;