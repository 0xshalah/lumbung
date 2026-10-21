export const LogoMark = ({ size = 28 }) => (
  <img
    src={`${process.env.PUBLIC_URL}/logo-mark.png`}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    className="rounded-[7px] ring-1 ring-[#1F2126]"
    style={{ objectFit: "cover" }}
  />
);

export const Logo = () => (
  <a href="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
    <span className="transition-transform duration-200 group-hover:-rotate-6"><LogoMark /></span>
    <span className="text-[16px] font-semibold tracking-tight text-[#E7E9EE]">Lumbung</span>
  </a>
);
