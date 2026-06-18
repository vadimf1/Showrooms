function toneFromHex(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (ch: number, t: number, a: number) => Math.round(ch + (t - ch) * a);
  return {
    top: `rgb(${mix(r,255,.42)},${mix(g,255,.42)},${mix(b,255,.42)})`,
    bot: `rgb(${mix(r,0,.22)},${mix(g,0,.22)},${mix(b,0,.22)})`,
  };
}

export function BodySVG({ style }: { style: string }) {
  const p = { viewBox: '0 0 200 80', preserveAspectRatio: 'xMidYMid meet' };
  switch (style) {
    case 'SEDAN':       return <svg {...p}><path d="M14 60C14 60,22 44,38 42L70 38C80 30,100 26,120 28L148 32C162 34,176 42,186 48L186 60Z" fill="currentColor" opacity="0.92"/><circle cx="52" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="150" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'WAGON':       return <svg {...p}><path d="M14 60C14 60,18 42,34 40L70 36C80 28,100 24,130 26L172 30C184 34,190 44,190 50L190 60Z" fill="currentColor" opacity="0.92"/><circle cx="50" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="156" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'COUPE':       return <svg {...p}><path d="M14 60C14 60,22 46,40 44L62 42C76 26,110 22,140 30L168 38C180 42,188 48,188 54L188 60Z" fill="currentColor" opacity="0.92"/><circle cx="56" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="152" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'HATCHBACK':   return <svg {...p}><path d="M16 60C16 60,22 46,36 44L64 42C76 30,96 26,118 28L152 34C162 36,170 42,170 50L170 60Z" fill="currentColor" opacity="0.92"/><circle cx="50" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="138" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'SUV':         return <svg {...p}><path d="M14 58C14 58,18 38,34 36L72 32C84 22,108 20,132 22L170 28C184 32,190 42,190 50L190 58Z" fill="currentColor" opacity="0.92"/><circle cx="52" cy="62" r="11" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="156" cy="62" r="11" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'CONVERTIBLE': return <svg {...p}><path d="M14 60C14 60,22 46,38 44L70 40C84 38,110 38,140 40L168 44C180 46,188 50,188 56L188 60Z" fill="currentColor" opacity="0.92"/><path d="M70 40C86 36,130 36,148 40" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" fill="none"/><circle cx="52" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="152" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'PICKUP':      return <svg {...p}><path d="M14 60C14 60,18 42,34 40L72 36C80 28,98 26,116 28L116 38L180 38C188 38,192 44,192 52L192 60Z" fill="currentColor" opacity="0.92"/><circle cx="52" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="160" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'MINIVAN':     return <svg {...p}><path d="M16 60C16 60,20 38,36 34L72 30C84 22,130 22,158 26L180 32C190 36,194 46,194 54L194 60Z" fill="currentColor" opacity="0.92"/><circle cx="52" cy="62" r="11" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="160" cy="62" r="11" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    case 'VAN':         return <svg {...p}><path d="M16 60L16 30C20 26,36 24,60 24L172 26C188 28,194 36,194 48L194 60Z" fill="currentColor" opacity="0.92"/><circle cx="52" cy="62" r="11" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="162" cy="62" r="11" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
    default:            return <svg {...p}><path d="M14 60C14 60,22 44,38 42L70 38C80 30,100 26,120 28L148 32C162 34,176 42,186 48L186 60Z" fill="currentColor" opacity="0.92"/><circle cx="52" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/><circle cx="150" cy="62" r="10" fill="transparent" stroke="currentColor" strokeWidth="3"/></svg>;
  }
}

type Props = { hex: string; bodyStyle?: string; tag?: string };

export default function ColorPlaceholder({ hex, bodyStyle, tag }: Props) {
  const { top, bot } = toneFromHex(hex || '#cccccc');
  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg,${top} 0%,${bot} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div className="ph-stripes" />
      <div style={{ color: 'rgba(255,255,255,.35)', width: '52%', maxWidth: 320 }}>
        <BodySVG style={bodyStyle ?? 'SEDAN'} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.45)', letterSpacing: '0.03em', fontFamily: 'JetBrains Mono, monospace' }}>
        Фото скоро появится
      </div>
      {tag && <div className="photo-tag">{tag}</div>}
    </div>
  );
}
