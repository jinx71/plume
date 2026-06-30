import { forwardRef } from 'react';
import cn from '../utils/cn';

const baseField =
  'w-full bg-white border rounded-xl px-3.5 text-ink placeholder:text-muted/60 transition-colors focus:border-indigo focus:ring-2 focus:ring-indigo/20 focus:outline-none';

// Labelled text input with inline error messaging.
export const Input = forwardRef(({ label, error, id, className = '', ...props }, ref) => {
  const fieldId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        ref={ref}
        className={cn(baseField, 'h-11', error ? 'border-danger' : 'border-line', className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

// Multi-line variant for bios and longer text.
export const TextArea = forwardRef(({ label, error, id, className = '', rows = 3, ...props }, ref) => {
  const fieldId = id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        className={cn(baseField, 'py-2.5 resize-none', error ? 'border-danger' : 'border-line', className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default Input;
