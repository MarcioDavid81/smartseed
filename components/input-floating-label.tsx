"use client";

import { Control } from "react-hook-form";

type FloatingInputProps = {
  control?: Control<any>;
  label: string;
  type?: string;
  helper?: (value: string) => string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
};

export function InputFloatingLabel({
  label,
  type,
  helper,
  value,
  onChange,
  required,
  className,
  ...props
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        id="floating_outlined"
        className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent  border rounded-lg border-1 border-gray-300 focus:border focus:border-green appearance-none dark:text-white dark:border-gray-600 dark:focus:border-green focus:outline-none focus:ring-0 peer"
        placeholder=" "
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
      <label htmlFor="floating_outlined" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-green peer-focus:dark:text-green peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">{label}</label>
    </div>
  )
}
