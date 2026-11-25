import { forwardRef, InputHTMLAttributes } from "react";
import { Input } from "./ui/input";

export interface NumberFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  value: number;
  allowNegative?: boolean;
  onValueChange: (value: number) => void;
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ onChange, allowNegative = false, onValueChange, value, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        inputMode="numeric"
        onWheel={(e) => e.currentTarget.blur()}
        onKeyDown={(evt) =>
          ["e", "E", "+", ...(!allowNegative ? ["-"] : [])].includes(evt.key) &&
          evt.preventDefault()
        }
        onChange={(e) => {
          onChange?.(e);
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
  },
);

NumberField.displayName = "NumberField";

export default NumberField;
