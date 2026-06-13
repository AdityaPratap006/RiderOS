
interface TextInputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    inputName?: string;
}

export const TextInput = ({
    value,
    onChange,
    inputName,
    placeholder = "Type your message...",
    className = "",
}: TextInputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div className="w-full flex flex-col gap-1">
            {inputName && (
                <span className="text-accent text-sm mb-1 block">{inputName}</span>
            )}
            <input
                type="text"
                className={`w-full p-2 rounded bg-gray-800 text-white border border-accent/60 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            />
        </div>
    )
}
