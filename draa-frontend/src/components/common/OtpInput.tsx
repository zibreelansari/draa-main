import React, { useRef, useEffect } from"react";
import"./OtpInput.css";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
}

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  length = 6,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into array of characters
  const values = (value ||"").split("");

  // Ensure values array has exact length
  const otpValues = Array.from({ length }, (_, i) => values[i] ||"");

  // Auto-focus the first box on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g,""); // Allow only digits
    if (disabled) return;

    const newValues = [...otpValues];
    // Keep only the last character entered
    newValues[index] = val.slice(-1);
    const newValueString = newValues.join("");
    onChange(newValueString);

    // If a digit was typed, move focus to the next input
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key ==="Backspace") {
      e.preventDefault();
      const newValues = [...otpValues];
      
      if (otpValues[index]) {
        // Clear current value
        newValues[index] ="";
        onChange(newValues.join(""));
      } else if (index > 0) {
        // If current is empty, move focus to previous input and clear it
        newValues[index - 1] ="";
        onChange(newValues.join(""));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key ==="ArrowLeft" && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key ==="ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g,"");
    if (!pastedData) return;

    const newOtp = pastedData.slice(0, length);
    onChange(newOtp);

    // Focus on the next empty or last input
    const nextIndex = Math.min(newOtp.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="otp-input-container">
      {otpValues.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleInputChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`otp-box ${digit ?"filled" :""}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
