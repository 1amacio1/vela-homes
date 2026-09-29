"use client";
import { useState } from "react";

/** Форматирует цифры в вид +7 (999) 123-45-67 по мере ввода. */
export function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (!d) return "";
  // Код страны: «+7» из маски либо ведущие 7/8 у полного номера.
  if (raw.trim().startsWith("+7") && d[0] === "7") d = d.slice(1);
  else if (d.length >= 11 && (d[0] === "7" || d[0] === "8")) d = d.slice(1);
  // Привычная восьмёрка, набранная после «+7»: убираем, когда номер полный.
  if (d.length > 10 && (d[0] === "8" || d[0] === "7")) d = d.slice(1);
  d = d.slice(0, 10);
  let out = "+7";
  if (d.length) out += " (" + d.slice(0, 3);
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += "-" + d.slice(6, 8);
  if (d.length > 8) out += "-" + d.slice(8, 10);
  return out;
}

export function PhoneInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [value, setValue] = useState("");
  return (
    <input
      {...props}
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
        if (value.replace(/\D/g, "").length <= 1) setValue("");
        props.onBlur?.(e);
      }}
      onChange={(e) => {
        const next = e.target.value;
        const digits = (v: string) => v.replace(/\D/g, "");
        // Стирание служебного символа (скобки, дефиса): убираем и цифру перед ним,
        // иначе маска вернёт символ и поле «залипнет».
        if (next.length < value.length && digits(next).length === digits(value).length) {
          setValue(formatPhone(digits(next).slice(0, -1)));
          return;
        }
        setValue(formatPhone(next));
      }}
      onKeyDown={(e) => {
        if (e.key === "Backspace" && value.replace(/\D/g, "").length <= 1) {
          e.preventDefault();
          setValue("+7 ");
        }
      }}
    />
  );
}
