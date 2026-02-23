import React, { useState, useEffect } from 'react';
import { formatNaira, parseMoney } from '../utils/currencyUtils';

export default function MoneyInput({ label, value, onChange, onBlur, error, required, placeholder = "0", className = "", ...props }) {
    // Local state to manage the displayed formatted string
    const [displayValue, setDisplayValue] = useState("");

    // Sync external numeric value to local display string 
    useEffect(() => {
        if (value !== undefined && value !== null && value !== '') {
            // Avoid re-formatting if the user is currently typing and ends with a decimal e.g. "1,000."
            // We only strictly re-format if the parsed value changes drastically from outside.
            const currentParsed = parseMoney(displayValue);
            if (currentParsed !== value) {
                setDisplayValue(formatNaira(value));
            }
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const handleInputChange = (e) => {
        const rawVal = e.target.value;

        // Allow empty
        if (!rawVal || rawVal.trim() === '' || rawVal === '₦' || rawVal === '₦ ') {
            setDisplayValue('');
            if (onChange) onChange('');
            return;
        }

        // Attempt to parse
        const parsed = parseMoney(rawVal);

        // If it's a valid number, we update the display to format and emit the parsed pure number
        if (parsed !== '' && !isNaN(parsed)) {
            // Check if user is typing a decimal point, don't immediately wipe it out in the display
            if (rawVal.endsWith('.') || rawVal.endsWith('.0')) {
                // Just let them type it, we'll format it once they move on or enter next digit
                setDisplayValue(rawVal.startsWith('₦') ? rawVal : `₦ ${rawVal}`);
            } else {
                setDisplayValue(formatNaira(parsed));
            }
            if (onChange) onChange(parsed);
        } else {
            // Maybe user deleted everything or typed invalid chars.
            // E.g. rawVal === "₦ a" -> parseMoney -> ''
            if (parsed === '') {
                setDisplayValue('');
                if (onChange) onChange('');
            } else {
                setDisplayValue(rawVal); // temporarily show it even if weird? 
            }
        }
    };

    const handleBlur = (e) => {
        // Force final format on blur
        if (displayValue) {
            const parsed = parseMoney(displayValue);
            if (parsed !== '' && !isNaN(parsed)) {
                setDisplayValue(formatNaira(parsed));
            }
        }
        if (onBlur) onBlur(e);
    };

    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label className="input-label">
                    {label} {required && <span className="required">*</span>}
                </label>
            )}
            <input
                type="text"
                className={`input ${error ? 'input-error-state' : ''}`}
                placeholder={placeholder}
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                {...props}
            />
            {error && <span className="input-error">{error}</span>}
        </div>
    );
}
