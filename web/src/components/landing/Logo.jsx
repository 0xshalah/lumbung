export const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="7" fill="#121317" stroke="#1F2126" />
    <path d="M5 14 16 6l11 8" fill="none" stroke="#E8B33A" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M8 14v11h16V14" fill="none" stroke="#E8B33A" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M12 18h8M12 21.5h8" stroke="#E8B33A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Logo = () => (
  <a href="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
    <span className="transition-transform duration-200 group-hover:-rotate-6"><LogoMark /></span>
    <span className="text-[16px] font-semibold tracking-tight text-[#E7E9EE]">Lumbung</span>
  </a>
);
