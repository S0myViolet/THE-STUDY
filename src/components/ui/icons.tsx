import React from "react";

type P = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 16) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

/* A deliberately restrained line-icon set. No emoji anywhere. */
export const I = {
  Desk: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 10h18M5 10v9M19 10v9M8 10V6h8v4M10 19h4" />
    </svg>
  ),
  Case: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 5h11l5 5v9H4z M15 5v5h5 M7 13h8M7 16h8" />
    </svg>
  ),
  Eye: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  Branch: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M6 3v18M6 9c0 3 3 3 6 3s6 0 6-3V3" />
      <circle cx="18" cy="3" r="1" />
    </svg>
  ),
  Salon: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 5h11v8H8l-4 3z M14 9h6v8h-2l-3 3v-3h-1" />
    </svg>
  ),
  Strategy: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 20V4h16M8 16l4-6 4 3 4-7" />
    </svg>
  ),
  Memory: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 21V9l8-6 8 6v12H4z M10 21v-6h4v6" />
    </svg>
  ),
  Archive: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 4h4v16H4zM10 4h4v16h-4zM16 6l4-1 3 15-4 1z" />
    </svg>
  ),
  Rhetoric: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 20l3-1 12-12-2-2L5 17zM14 6l2 2" />
    </svg>
  ),
  Cabinet: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 4h16v16H4zM4 12h16M12 4v16M9 8h.01M15 16h.01" />
    </svg>
  ),
  Field: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 21s-6-6-6-11a6 6 0 0112 0c0 5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  ),
  Thread: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 18c4-2 4-10 8-10s4 8 8 6" />
      <circle cx="4" cy="18" r="1" />
      <circle cx="20" cy="14" r="1" />
    </svg>
  ),
  Profile: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </svg>
  ),
  Search: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  ),
  Settings: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  ),
  Investigate: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 6h16M4 12h10M4 18h7" />
      <circle cx="18" cy="17" r="3" />
      <path d="M20.5 19.5L22 21" />
    </svg>
  ),
  Forecast: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 20h18M5 16l4-5 4 3 6-8" />
      <path d="M17 6h2v2" />
    </svg>
  ),
  Decision: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 3v18M12 8l-6 4 6 4M12 8l6 4-6 4" />
    </svg>
  ),
  Debrief: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 4h14v16H5z M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
  Curator: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 3l2.5 6 6.5.5-5 4.2 1.7 6.3L12 16.5 6.3 20l1.7-6.3-5-4.2 6.5-.5z" />
    </svg>
  ),
  /* V2 sections and rooms */
  Today: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h5" />
    </svg>
  ),
  Learn: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 5h6a3 3 0 013 3v12a2 2 0 00-2-2H3zM21 5h-6a3 3 0 00-3 3v12a2 2 0 012-2h7zM6 9h3M15 9h3M6 13h3" />
    </svg>
  ),
  Train: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </svg>
  ),
  Build: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 20h16M6 20V9M12 20V9M18 20V9M3 9l9-5 9 5" />
    </svg>
  ),
  Prove: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="10" r="6" />
      <path d="M9 15l-1.5 6 4.5-2.5L16.5 21 15 15M9.5 10l1.8 1.8L14.5 8.5" />
    </svg>
  ),
  Review: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 20h16M6 16v-5M10 16V6M14 16v-8M18 16v-3" />
    </svg>
  ),
  Library: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 4h4v16H4zM9 4h4v16H9zM15 6l4-1 2 14-4 1zM4 16h9" />
    </svg>
  ),
  Pen: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 20h16M6 16l10-10 2 2L8 18l-3 1zM14 8l2 2" />
    </svg>
  ),
  Door: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 21V4a1 1 0 011-1h12a1 1 0 011 1v17M3 21h18M15 12h.01" />
    </svg>
  ),
  Leave: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M10 4H5a1 1 0 00-1 1v14a1 1 0 001 1h5M14 8l4 4-4 4M9 12h9" />
    </svg>
  ),
  ArrowRight: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  ArrowLeft: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
  Up: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  ),
  Down: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  ),
  Close: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Check: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  Menu: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Plus: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Clock: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  ),
  Book: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 4h7a2 2 0 012 2v14a2 2 0 00-2-2H4zM20 4h-7a2 2 0 00-2 2v14a2 2 0 012-2h7z" />
    </svg>
  ),
  Sun: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  Moon: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />
    </svg>
  ),
  Collapse: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 4v16M20 4v16M9 12h6M12 9l-3 3 3 3" />
    </svg>
  ),
  Expand: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M4 4v16M20 4v16M9 12h6M12 9l3 3-3 3" />
    </svg>
  ),
  Map: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14" />
    </svg>
  ),
  Timeline: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M3 12h18" />
      <circle cx="7" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="17" cy="12" r="1.5" />
      <path d="M7 8v-2M12 16v2M17 8v-2" />
    </svg>
  ),
  Graph: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="9" cy="18" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M8 6l8 2M7 8l2 8M16 9l1 6M11 17h4" />
    </svg>
  ),
  Mic: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v3" />
    </svg>
  ),
  Refresh: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3M4 4v5h5M20 20v-5h-5" />
    </svg>
  ),
  Sparkle: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2" />
    </svg>
  ),
  Bell: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <path d="M6 16V11a6 6 0 0112 0v5l2 2H4zM10 20a2 2 0 004 0" />
    </svg>
  ),
  Info: ({ size, ...p }: P) => (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  ),
};

export type IconName = keyof typeof I;
