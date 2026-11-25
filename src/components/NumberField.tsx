import { InputHTMLAttributes } from "react";
import { Input } from "./ui/input";

const NumberField = ({
  onChange,
  allowNegative = false,
  onValueChange,
  value,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  value: number;
  allowNegative?: boolean;
  onValueChange: (value: number) => void;
}) => {
  return (
    <Input
      type="number"
      inputMode="numeric"
      onWheel={(e) => e.currentTarget.blur()}
      onKeyDown={(evt) =>
        ["e", "E", "+", ...(!allowNegative ? ["-"] : [])].includes(evt.key) &&
        evt.preventDefault()
      }
      onChange={(e) => {
        if (
          (!allowNegative && e.target.valueAsNumber < 0) ||
          isNaN(e.target.valueAsNumber)
        ) {
          onValueChange(0);
        } else {
          onValueChange?.(e.target.valueAsNumber);
        }
      }}
      value={value}
      {...props}
    />
  );
};

export default NumberField;
