"use client";
import { useLayoutEffect, useRef, useState } from "react";

const digitsOf = (v: string) => v.replace(/\D/g, "");

/** Национальная часть номера (до 10 цифр) из любого ввода. */
export function nationalDigits(raw: string) {
  let d = digitsOf(raw);
  if (!d) return "";
  if (raw.trim().startsWith("+7") && d[0] === "7") d = d.slice(1);
  else if (d.length >= 11 && (d[0] === "7" || d[0] === "8")) d = d.slice(1);
  if (d.length > 10 && (d[0] === "8" || d[0] === "7")) d = d.slice(1);
  return d.slice(0, 10);
}

/** +7 (999) 123-45-67 из национальных цифр. */
export function formatNational(d: string) {
  if (!d) return "";
  let out = "+7";
  if (d.length) out += " (" + d.slice(0, 3);
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += "-" + d.slice(6, 8);
  if (d.length > 8) out += "-" + d.slice(8, 10);
  return out;
}

export const formatPhone = (raw: string) => formatNational(nationalDigits(raw));

/** Позиция каретки после n-й национальной цифры в отформатированной строке. */
function caretAfterDigits(formatted: string, n: number) {
  if (n <= 0) return Math.min(formatted.length, 4); // после "+7 ("
  let seen = 0;
  for (let i = 2; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === n) return i + 1;
    }
  }
  return formatted.length;
}

export function PhoneInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (caret.current !== null && ref.current) {
      ref.current.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  }, [value]);
  const apply = (national: string, digitsBeforeCaret: number) => {
    const next = formatNational(national);
    caret.current = caretAfterDigits(next, digitsBeforeCaret);
    setValue(next);
  };
  return (
    <input
      {...props}
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      placeholder="+7 (___) ___-__-__"
      onFocus={(e) => {
        if (!value) setValue("+7 ");
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        if (nationalDigits(value).length === 0) setValue("");
        props.onBlur?.(e);
      }}
      onChange={(e) => {
        const next = e.target.value;
        const pos = e.target.selectionStart ?? next.length;
        const nextNat = nationalDigits(next);
        const prevNat = nationalDigits(value);
        // Национальные цифры слева от каретки (без «7» кода страны).
        const before = next.slice(0, pos);
        let k = digitsOf(before).length;
        if (before.trim().startsWith("+7") && digitsOf(before)[0] === "7") k -= 1;
        k = Math.max(0, Math.min(k, nextNat.length));
        // Удалён служебный символ (скобка, дефис, пробел): убираем цифру перед ним.
        if (next.length < value.length && nextNat.length === prevNat.length && k > 0) {
          apply(nextNat.slice(0, k - 1) + nextNat.slice(k), k - 1);
          return;
        }
        apply(nextNat, k);
      }}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && nationalDigits(value).length === 0) {
          e.preventDefault();
          setValue("+7 ");
        }
      }}
    />
  );
}
