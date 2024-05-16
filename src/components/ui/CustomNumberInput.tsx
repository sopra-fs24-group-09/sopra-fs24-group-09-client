import React from "react";
import "../../styles/ui/CustomNumberInput.scss";

interface CustomNumberInputProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({ min, max, value, onChange }) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="custom-number-input">
      <button onClick={handleDecrement} disabled={value <= min}>-</button>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        readOnly
        min={min}
        max={max}
      />
      <button onClick={handleIncrement} disabled={value >= max}>+</button>
    </div>
  );
};

export default CustomNumberInput;
