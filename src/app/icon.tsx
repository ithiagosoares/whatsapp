import { type SVGProps } from "react";

const Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width="1em"
    height="1em"
    {...props}
  >
    <defs>
      <linearGradient id="a" x1={128} x2={128} y1={232} y2={24} gradientUnits="userSpaceOnUse">
        <stop stopColor="#3F51B5" offset={0} />
        <stop stopColor="#5C6BC0" offset={1} />
      </linearGradient>
      <linearGradient id="b" x1={192} x2={192} y1={232} y2={128} gradientUnits="userSpaceOnUse">
        <stop stopColor="#1A237E" offset={0} />
        <stop stopColor="#3F51B5" offset={1} />
      </linearGradient>
    </defs>
    <path fill="url(#a)" d="m232 128-40 104H64L24 128l40-40 64-84 64 84Z" />
    <path fill="url(#b)" d="m192 128-32 32-32-32 32-84Z" />
    <path fill="#7CFC00" d="M128 160v48l32-16-32-32Zm0 0-32 32 32 16v-48Z" />
    <path fill="#C5E1A5" d="m128 44 32 84-32-32-32 32Z" />
  </svg>
);

export default Icon;
