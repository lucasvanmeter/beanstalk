import { SelectHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  initialOptionText?: string;
  label?: string;
};

export function Select({
  label,
  id,
  initialOptionText,
  className,
  onChange,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={twMerge(className, "relative flex flex-col text-gray-400")}>
      {label && (
        <label for={id} className={"absolute -top-5 px-4 text-sm"}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={twMerge(
          className,
          "h-full w-full border border-gray-600 bg-slate-900 px-4 py-2 text-gray-400",
        )}
        onChange={onChange}
        {...props}
      >
        {initialOptionText && <option>{initialOptionText}</option>}
        {children}
      </select>
    </div>
  );
}