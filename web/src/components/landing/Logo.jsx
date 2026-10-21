export const LogoMark = ({ size = 28 }) => (
  <img
    src={`${process.env.PUBLIC_URL}/logo-mark.png`}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    className="block"
    style={{ objectFit: "cover" }}
  />
);

export const Logo = () => (
  <a href="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
    <span className="transition-transform duration-200 group-hover:-rotate-6"><LogoMark /></span>
    <span className="text-[16px] font-semibold tracking-tight text-[#E7E9EE]">Lumbung</span>
  </a>
);
