import React, { useState, useLayoutEffect } from "react";

type CounterDownProps = {
    endTimeString: string;
};

export const CounterDown: React.FC<CounterDownProps> = ({ endTimeString }) => {
  const [timeLeft, setTimeLeft] = useState<number>();

  useLayoutEffect(() => {
    // const now = Date.now();
    // console.log(`[debug][${now}-countdown-useLayoutEffect]endTimeString`, endTimeString);
    if (endTimeString === null || endTimeString === "") {
      return;
    }
    const updateCountdown= () => {
      const cleanedEndTimeString = endTimeString.replace("[UTC]", "").trim();
      const endTime = new Date(cleanedEndTimeString).getTime();
      const now = Date.now();
      //   console.log(`[debug][${now}-countdown-interval]`, endTimeString);
      const leftTimeSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(leftTimeSeconds);
    }
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [endTimeString]);

  return (
    <>
      <div className="gameroom counterdiv">
        <i className={"twa twa-stopwatch"} style={{ fontSize: "2.6rem" }} />
        <span className="gameroom counternum">{timeLeft}</span>
      </div>
    </>
  );
};

export default CounterDown;