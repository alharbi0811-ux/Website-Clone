import React from "react";

export interface ExternalDesign {
  bgType: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgGradientAngle: number;
  bgImageUrl: string | null;
  bgOverlayColor: string;
  bgOverlayOpacity: number;

  showBadge: boolean;
  badgeText: string;
  badgeTextColor: string;
  badgeBgColor: string;
  badgeBorderColor: string;

  showImage: boolean;
  imageMaxWidth: number;
  imageBorderRadius: number;
  imageHasShadow: boolean;

  showTitle: boolean;
  titleColor: string;
  titleSize: number;
  titleAlign: "center" | "right" | "left";
  titleWeight: string;
  titleHasShadow: boolean;

  contentColor: string;
  contentSize: number;
  contentAlign: "center" | "right" | "left";
  contentWeight: string;

  verticalAlign: "center" | "top";
  elementSpacing: number;
  pagePadding: number;
}

export const DEFAULT_EXTERNAL_DESIGN: ExternalDesign = {
  bgType: "gradient",
  bgColor: "#0b0b14",
  bgGradientFrom: "#0b0b14",
  bgGradientTo: "#12122a",
  bgGradientAngle: 160,
  bgImageUrl: null,
  bgOverlayColor: "#000000",
  bgOverlayOpacity: 50,

  showBadge: true,
  badgeText: "بدون كلام",
  badgeTextColor: "#9b6dff",
  badgeBgColor: "rgba(123,47,190,0.15)",
  badgeBorderColor: "rgba(123,47,190,0.3)",

  showImage: true,
  imageMaxWidth: 576,
  imageBorderRadius: 16,
  imageHasShadow: true,

  showTitle: true,
  titleColor: "#ffffff",
  titleSize: 52,
  titleAlign: "center",
  titleWeight: "900",
  titleHasShadow: true,

  contentColor: "#ffffff",
  contentSize: 64,
  contentAlign: "center",
  contentWeight: "900",

  verticalAlign: "center",
  elementSpacing: 24,
  pagePadding: 24,
};

export function parseDesign(json: string | null | undefined): ExternalDesign {
  try {
    const parsed = JSON.parse(json || "{}");
    return { ...DEFAULT_EXTERNAL_DESIGN, ...parsed };
  } catch {
    return { ...DEFAULT_EXTERNAL_DESIGN };
  }
}

function getBg(d: ExternalDesign): React.CSSProperties {
  if (d.bgType === "image" && d.bgImageUrl) {
    return {
      backgroundImage: `url(${d.bgImageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (d.bgType === "gradient") {
    return {
      background: `linear-gradient(${d.bgGradientAngle}deg, ${d.bgGradientFrom} 0%, ${d.bgGradientTo} 100%)`,
    };
  }
  return { background: d.bgColor };
}

interface Props {
  title: string;
  imageUrl?: string | null;
  contentText?: string | null;
  design: ExternalDesign;
  scale?: number;
}

export default function ExternalPageRenderer({ title, imageUrl, contentText, design, scale = 1 }: Props) {
  const gap = design.elementSpacing;
  const pad = design.pagePadding;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        ...getBg(design),
        position: "relative",
        overflow: "hidden",
        fontFamily: "Lalezar, sans-serif",
      }}
      dir="rtl"
    >
      {/* Background image overlay */}
      {design.bgType === "image" && design.bgImageUrl && design.bgOverlayOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: design.bgOverlayColor,
            opacity: design.bgOverlayOpacity / 100,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Badge */}
      {design.showBadge && (
        <div className="flex justify-center" style={{ paddingTop: pad, position: "relative", zIndex: 1 }}>
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{
              background: design.badgeBgColor,
              border: `1px solid ${design.badgeBorderColor}`,
              color: design.badgeTextColor,
              fontSize: Math.round(14 * scale),
            }}
          >
            {design.badgeText || "بدون كلام"}
          </span>
        </div>
      )}

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col ${design.verticalAlign === "center" ? "items-center justify-center" : "items-center justify-start"}`}
        style={{ padding: `${gap}px ${pad}px ${pad}px`, position: "relative", zIndex: 1, gap }}
      >
        {/* Image */}
        {design.showImage && imageUrl && (
          <div
            style={{
              width: "100%",
              maxWidth: design.imageMaxWidth,
              borderRadius: design.imageBorderRadius,
              overflow: "hidden",
              boxShadow: design.imageHasShadow ? "0 0 40px rgba(123,47,190,0.3)" : "none",
            }}
          >
            <img src={imageUrl} alt={title} style={{ width: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {/* Title */}
        {design.showTitle && <h1
          style={{
            color: design.titleColor,
            fontSize: Math.round(design.titleSize * scale),
            fontWeight: design.titleWeight,
            textAlign: design.titleAlign,
            textShadow: design.titleHasShadow ? "0 0 30px rgba(123,47,190,0.5)" : "none",
            lineHeight: 1.2,
            margin: 0,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {title}
        </h1>}

        {/* Content text */}
        {contentText && (
          <p
            style={{
              color: design.contentColor,
              fontSize: Math.round(design.contentSize * scale),
              fontWeight: design.contentWeight,
              textAlign: design.contentAlign,
              lineHeight: 1.3,
              maxWidth: 900,
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {contentText}
          </p>
        )}
      </div>
    </div>
  );
}
