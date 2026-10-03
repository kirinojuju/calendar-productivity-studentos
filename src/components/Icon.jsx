export default function Icon({ name, size = 16 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21v-7h6v7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    check: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="m8 12 3 3 5-6" /></>,
    cap: <><path d="m2 9 10-5 10 5-10 5zM6 11v5c4 3 8 3 12 0v-5M22 9v7" /></>,
    wallet: <><rect x="3" y="6" width="18" height="15" rx="2" /><path d="M3 9h18M6 6V4h12M16 15h3" /></>,
    note: <><path d="M5 3h14v18H5zM9 8h6M9 12h6M9 16h4" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4" /></>,
    user: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="9" r="3" /><path d="M6.5 19c.7-3 2.7-4.5 5.5-4.5s4.8 1.5 5.5 4.5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    document: <><path d="M6 3h9l4 4v14H6zM15 3v5h4" /></>,
    rocket: <><path d="M4 14c1-5 5-9 15-10-1 10-5 14-10 15zM13 7l4 4M4 14l-2 5 5-2M9 19l-2 3" /><circle cx="14" cy="10" r="1" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    down: <path d="m6 9 6 6 6-6" />,
    close: <path d="M5 5 19 19M19 5 5 19" />,
    star: <path d="m12 2 3 6.5 7 .9-5.1 5 1.3 7-6.2-3.3-6.2 3.3 1.3-7L2 9.4l7-.9z" />,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v7M14 11v7" /></>,
    edit: <><path d="M4 20h4l12-12-4-4L4 16zM14 6l4 4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
