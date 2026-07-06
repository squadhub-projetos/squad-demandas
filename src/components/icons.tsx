import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const strokeDefaults = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconText(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  );
}

export function IconMic(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function IconClip(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="m21.44 11.05-8.72 8.72a5.5 5.5 0 1 1-7.78-7.78l8.72-8.72a3.67 3.67 0 0 1 5.19 5.19l-8.73 8.72a1.83 1.83 0 0 1-2.6-2.6l8.06-8.05" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="m10.29 3.86-8.2 14.14A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.73-3L13.73 3.86a2 2 0 0 0-3.44 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="M3 12a9 9 0 0 1 15.55-6.19L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.55 6.19L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconSend(props: IconProps) {
  return (
    <svg {...strokeDefaults} {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

export function IconStop(props: IconProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
    </svg>
  );
}
