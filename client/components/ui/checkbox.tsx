import React, { forwardRef, useCallback, useEffect, useId, useRef } from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'children'> {
  label: string;
  description?: string;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  checkboxClassName?: string;
  labelClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      description,
      indeterminate = false,
      onCheckedChange,
      checkboxClassName,
      labelClassName,
      className,
      defaultChecked,
      checked,
      disabled,
      required,
      value,
      name,
      onBlur,
      onFocus,
      onInvalid,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked);
      }
      if (onChange) {
        onChange(event);
      }
    };

    return (
      <div
        className={cn(
          'aegov-check-item flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-slate-800 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)] transition-colors duration-200',
          disabled && 'opacity-60',
          className,
        )}
      >
        <input
          {...rest}
          id={id}
          ref={setRefs}
          type="checkbox"
          className={cn(
            'mt-1 h-4 w-4 shrink-0 rounded-sm border border-neutral-400 bg-white text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
            checkboxClassName,
          )}
          defaultChecked={defaultChecked}
          checked={checked}
          disabled={disabled}
          required={required}
          value={value}
          name={name}
          onBlur={onBlur}
          onFocus={onFocus}
          onInvalid={onInvalid}
          onChange={handleChange}
          aria-label={label}
        />
        <label
          htmlFor={id}
          className={cn('flex flex-1 flex-col text-sm font-medium text-slate-900', labelClassName)}
        >
          <span>{label}</span>
          {description ? <span className="mt-1 text-xs text-slate-500">{description}</span> : null}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
