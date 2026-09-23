import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const icons = {
  "up-right": ArrowUpRight,
  left: ArrowLeft,
  right: ArrowRight,
  down: ArrowDown,
};

/** Decorative directions use SVG, never platform-dependent emoji glyphs. */
export function DirectionIcon({
  direction = "up-right",
  className = "",
  size = 18,
}: {
  direction?: keyof typeof icons;
  className?: string;
  size?: number;
}) {
  const Icon = icons[direction];
  return (
    <Icon
      aria-hidden="true"
      focusable="false"
      className={`direction-icon ${className}`}
      size={size}
      strokeWidth={1.5}
    />
  );
}
