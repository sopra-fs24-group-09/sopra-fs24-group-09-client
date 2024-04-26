
import React, { useState } from "react";

type ValidateAnswerFormProps = {
  submitAnswer: (answer: string) => void;
  roundFinished: boolean;
};

export const ValidateAnswerForm = ({
  submitAnswer,
  roundFinished,
}: ValidateAnswerFormProps) => {
  const [validateAnswer, setValidateAnswer] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidateAnswer(e.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <input
        value={validateAnswer}
        onChange={handleInputChange}
        className="gameroom validateForm"
        type="text"
        placeholder="Validate your answer..."
      />
      <button
        className="gameroom validateUpload"
        disabled={!validateAnswer || roundFinished}
        onClick={() => validateAnswer && submitAnswer(validateAnswer)}
      >
        Submit
      </button>
    </div>
  );
};
