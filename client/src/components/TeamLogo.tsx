import { getTeamLogo, teamHue, teamInitials } from "@/lib/teamLogos";

const WILD_DOGS_CREST = "/assets/logo.webp";

interface TeamLogoProps {
  name: string;
  isWildDogs?: boolean;
  size?: number;
  className?: string;
}

export function TeamLogo({ name, isWildDogs = false, size = 40, className = "" }: TeamLogoProps) {
  const src = isWildDogs ? WILD_DOGS_CREST : getTeamLogo(name);
  const box = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        style={box}
        className={`object-contain shrink-0 ${className}`}
      />
    );
  }

  const hue = teamHue(name);
  return (
    <div
      role="img"
      aria-label={name}
      style={{
        ...box,
        background: `linear-gradient(180deg, hsl(${hue} 62% 52% / 0.35), hsl(${hue} 55% 22% / 0.9))`,
        borderColor: `hsl(${hue} 62% 52%)`,
        fontSize: size * 0.36,
      }}
      className={`shrink-0 rounded-full border-2 flex items-center justify-center font-black tracking-wide text-white ${className}`}
    >
      {teamInitials(name)}
    </div>
  );
}
