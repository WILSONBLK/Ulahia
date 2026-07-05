// Ulahia icon set — simple, recognizable, consistent line icons (brand board).
// All icons inherit color via currentColor and share a 24px grid.

function Icon({ children, size = 22 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconHome = (p) => (
  <Icon {...p}>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
    <path d="M10 20v-5h4v5" />
  </Icon>
)

export const IconCart = (p) => (
  <Icon {...p}>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.76L20 8H6" />
    <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconBox = (p) => (
  <Icon {...p}>
    <path d="M12 3 20 7v10l-8 4-8-4V7l8-4Z" />
    <path d="M4 7l8 4 8-4" />
    <path d="M12 11v10" />
  </Icon>
)

export const IconUsers = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 5.6a3.2 3.2 0 0 1 0 5.8" />
    <path d="M17.5 14.7c1.8.7 3 2.3 3 4.3" />
  </Icon>
)

export const IconMore = (p) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconReports = (p) => (
  <Icon {...p}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </Icon>
)

export const IconDebts = (p) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="17" rx="2" />
    <path d="M8 9h8" />
    <path d="M8 13h8" />
    <path d="M8 17h4" />
  </Icon>
)

export const IconExpenses = (p) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-2-1.4L14 21l-2-1.4L10 21l-2-1.4L6 21V3Z" />
    <path d="M9.5 8h5" />
    <path d="M9.5 12h5" />
  </Icon>
)

export const IconSettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" />
  </Icon>
)

export const IconHelp = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.3a2.6 2.6 0 0 1 5.1.7c0 1.7-2.6 2.1-2.6 3.5" />
    <circle cx="12" cy="16.8" r="1" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
    <path d="M10 8l4 4-4 4" />
    <path d="M14 12H4" />
  </Icon>
)

export const IconPlay = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.8v6.4l5-3.2-5-3.2Z" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconChevron = (p) => (
  <Icon {...p}>
    <path d="M9 5l7 7-7 7" />
  </Icon>
)

export const IconChevronDown = (p) => (
  <Icon {...p}>
    <path d="M5 9l7 7 7-7" />
  </Icon>
)

export const IconMenu = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
)

export const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Icon>
)

export const IconDrive = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
    <path d="M3.5 12.5h17" />
    <circle cx="8" cy="15.4" r="1" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconCamera = (p) => (
  <Icon {...p}>
    <path d="M4 8.5h3l1.5-2.2h7L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 18.5H4A1.5 1.5 0 0 1 2.5 17v-7A1.5 1.5 0 0 1 4 8.5Z" />
    <circle cx="12" cy="13" r="3.2" />
  </Icon>
)

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </Icon>
)

export const IconFilter = (p) => (
  <Icon {...p}>
    <path d="M4 6.5h16" />
    <path d="M7 12h10" />
    <path d="M10 17.5h4" />
  </Icon>
)

export const IconUserPlus = (p) => (
  <Icon {...p}>
    <circle cx="9.5" cy="8" r="3.4" />
    <path d="M3.5 19.5c0-3.2 2.7-5.3 6-5.3 1.2 0 2.4.3 3.3.8" />
    <path d="M18 14.5v5M15.5 17h5" />
  </Icon>
)

export const IconChat = (p) => (
  <Icon {...p}>
    <path d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v9a1.5 1.5 0 0 1-1.5 1.5H9l-4.5 3.7a.6.6 0 0 1-1-.47V7A1.5 1.5 0 0 1 4 5.5Z" />
    <path d="M7.5 10.2h9M7.5 13.3h5.5" />
  </Icon>
)

export const IconCash = (p) => (
  <Icon {...p}>
    <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5h.01M18 14.5h.01" />
  </Icon>
)

export const IconTransfer = (p) => (
  <Icon {...p}>
    <rect x="7" y="2.8" width="10" height="18.4" rx="2.2" />
    <path d="M11 5.6h2" />
    <path d="M2.5 10.5l2-2 2 2M4.5 8.5v5" />
    <path d="M21.5 13.5l-2 2-2-2M19.5 15.5v-5" />
  </Icon>
)

export const IconStar = (p) => (
  <Icon {...p}>
    <path d="M12 3.6l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.2 6.9 19l1.1-5.6L3.8 9.5l5.7-.7L12 3.6Z" />
  </Icon>
)

export const IconStarFilled = (p) => (
  <Icon {...p}>
    <path d="M12 3.6l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.2 6.9 19l1.1-5.6L3.8 9.5l5.7-.7L12 3.6Z" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconTrash = (p) => (
  <Icon {...p}>
    <path d="M5 7h14" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L18.5 7" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
)

export const IconBell = (p) => (
  <Icon {...p}>
    <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </Icon>
)

export const IconTag = (p) => (
  <Icon {...p}>
    <path d="M4 4.5h7.2a2 2 0 0 1 1.4.6l6.3 6.3a1.6 1.6 0 0 1 0 2.3l-5.8 5.8a1.6 1.6 0 0 1-2.3 0L4.5 13.2a2 2 0 0 1-.5-1.3V4.5Z" />
    <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconCoin = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.2A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2.1 0 2.9 6 1.3 6 4 0 1.2-1.3 2.1-3 2.1a3 3 0 0 1-2.5-1.2" />
    <path d="M12 6.4v1.5M12 16.1v1.5" />
  </Icon>
)

export const IconUser = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" />
  </Icon>
)

export const IconStore = (p) => (
  <Icon {...p}>
    <path d="M4.5 9.5 6 4.5h12l1.5 5" />
    <path d="M4.5 9.5a2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.8 0 2.4 2.4 0 0 0 4.8 0" />
    <path d="M5.5 12v8h13v-8" />
    <path d="M9.5 20v-5h5v5" />
  </Icon>
)

export const IconGlobe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.8 2.6 4 5.7 4 9s-1.2 6.4-4 9c-2.8-2.6-4-5.7-4-9s1.2-6.4 4-9Z" />
  </Icon>
)

export const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 3 20 6v6c0 4.8-3.2 8-8 9.5C7.2 20 4 16.8 4 12V6l8-3Z" />
    <path d="M9 12l2.2 2.2L15.5 10" />
  </Icon>
)

export const IconCloud = (p) => (
  <Icon {...p}>
    <path d="M7 18.5a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17.2 10a4 4 0 0 1-.7 8.5H7Z" />
  </Icon>
)

export const IconPhone = (p) => (
  <Icon {...p}>
    <path d="M5.5 4h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L16 14l4 1.5v3a1.5 1.5 0 0 1-1.7 1.5C10.6 19.4 4.6 13.4 4 6.7A1.5 1.5 0 0 1 5.5 4Z" />
  </Icon>
)

export const IconLock = (p) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconEye = (p) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)

export const IconEyeOff = (p) => (
  <Icon {...p}>
    <path d="M4 4l16 16" />
    <path d="M9.9 5.9A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.3 17.3 0 0 1-3 3.7M6.2 7.5A16.3 16.3 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.5-.7" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Icon>
)

export const IconX = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
  </Icon>
)
