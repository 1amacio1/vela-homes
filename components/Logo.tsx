/**
 * Логотип VELA: монограмма из двух скатов кровли, сходящихся в букву V,
 * и линии горизонта. Рядом — разреженный антиквенный логотип.
 */
export function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 9 L20 33 L36 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path d="M13 9 L20 19.5 L27 9" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3 36.5 H37" stroke="var(--accent)" strokeWidth="1.2" />
    </svg>
  );
}

export function Logo({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <a
      className={"logo" + (compact ? " compact" : "")}
      href={href}
      aria-label="VELA — главная"
    >
      <Mark />
      <span className="logo-word">
        VELA
        {!compact && <small>Архитектура жизни · с 2005</small>}
      </span>
    </a>
  );
}
