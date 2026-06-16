import { ChangeEvent } from "react";

interface SelectInputProps {
    options: string[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    inputName?: string;
}

export const SelectInput = ({ options, value, onChange, placeholder, inputName }: SelectInputProps) => {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="w-full flex flex-col gap-1">
            {inputName && (
                <span className="text-accent text-sm mb-1 block">{inputName}</span>
            )}
            <select
                className="w-full p-2 rounded bg-gray-800 text-white border border-accent/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={handleChange}
            >
                <option value="" disabled>{placeholder || "Select an option"}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}