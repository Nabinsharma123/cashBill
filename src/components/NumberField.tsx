import { forwardRef, InputHTMLAttributes } from 'react';
import { Input } from './ui/input';

export interface NumberFieldProps extends InputHTMLAttributes<HTMLInputElement> {}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type='number'
        onWheel={e => e.currentTarget.blur()}
        onKeyDown={evt => ['e', 'E', '+', '-'].includes(evt.key) && evt.preventDefault()}
        onChange={e => {
          if (e.target.valueAsNumber < 0) {
            onChange?.({ ...e, target: { ...e.target, value: '' } });
          } else {
            onChange?.(e);
          }
        }}
        {...props}
      />
    );
  }
);

NumberField.displayName = 'NumberField';

export default NumberField;
