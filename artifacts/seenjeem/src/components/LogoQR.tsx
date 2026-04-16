import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetchSiteLogo, getCachedLogoUrl } from "@/lib/siteLogoCache";

const DEFAULT_LOGO_SIZE_RATIO = 0.18;
const MAX_LOGO_RATIO = 0.25;

interface LogoQRProps {
  value: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  logoSizeRatio?: number;
  fgColor?: string;
  bgColor?: string;
}

export default function LogoQR({
  value,
  size = 180,
  style,
  className,
  logoSizeRatio = DEFAULT_LOGO_SIZE_RATIO,
  fgColor = "#000000",
  bgColor = "#ffffff",
}: LogoQRProps) {
  const cached = getCachedLogoUrl();
  const [logoUrl, setLogoUrl] = useState<string | null>(
    cached !== undefined ? cached : null
  );

  useEffect(() => {
    const c = getCachedLogoUrl();
    if (c !== undefined) {
      setLogoUrl(c);
      return;
    }
    fetchSiteLogo().then(setLogoUrl);
  }, []);

  const safeRatio = Math.min(logoSizeRatio, MAX_LOGO_RATIO);
  const logoPixels = Math.round(size * safeRatio);

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="H"
      fgColor={fgColor}
      bgColor={bgColor}
      style={style}
      className={className}
      {...(logoUrl
        ? {
            imageSettings: {
              src: logoUrl,
              height: logoPixels,
              width: logoPixels,
              excavate: true,
            },
          }
        : {})}
    />
  );
}
