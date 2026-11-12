// Ported 1:1 from assets/star-jar/demo.html — do not "improve" the motion.
export const STAR_JAR_CSS = `
.sj { position: relative; width: 100%; height: 100%; aspect-ratio: 1; overflow: visible;
      -webkit-tap-highlight-color: transparent; outline: none; }
.sj.sj-interactive { cursor: pointer; }
.sj.sj-idle { animation: sj-jar-bob 3.2s ease-in-out infinite; }
.sj img, .sj .sparkle { position: absolute; inset: 0; width: 100%; height: 100%;
       pointer-events: none; user-select: none; will-change: transform; }
.sj .body   { position: absolute; inset: 0; transform-origin: 52.03% 89.94%; will-change: transform; }
.sj .lid    { transform-origin: 39.35% 20.17%; will-change: transform; }
.sj .hero   { transform-origin: 67.85% 31.05%; }
.sj.sj-idle .hero { animation: sj-hero-float 2.6s ease-in-out infinite; }
.sj .spark  { transform-origin: 80.01% 16.05%; }
.sj.sj-idle .spark { animation: sj-spark-twinkle 2.4s ease-in-out infinite; }
.sj .stars  { transform-origin: 52.01% 62.60%; will-change: transform; }
.sj .sparkle { background: url(/star-jar/sparkle.webp) center/contain no-repeat; inset: auto;
               width: 9%; height: 9%; opacity: 0; object-fit: contain; }
.sj.sj-idle .sparkle { animation: sj-twinkle 2.8s ease-in-out infinite; }
.sj .s1 { left: 14%; top: 48%; animation-delay: .2s !important; }
.sj .s2 { left: 84%; top: 56%; animation-delay: 1.1s !important; width: 7% !important; height: 7% !important; }
.sj .s3 { left: 63%; top: 5%;  animation-delay: 1.9s !important; width: 6% !important; height: 6% !important; }

@keyframes sj-jar-bob     { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5%) } }
@keyframes sj-hero-float  { 0%,100% { transform: translateY(0) rotate(0) } 50% { transform: translateY(-2%) rotate(-6deg) } }
@keyframes sj-spark-twinkle { 0%,100% { transform: scale(1) rotate(0) } 50% { transform: scale(1.18) rotate(18deg) } }
@keyframes sj-twinkle { 0%,100% { opacity: 0; transform: scale(.4) rotate(0) } 45% { opacity: 1; transform: scale(1) rotate(45deg) } 70% { opacity: 0; transform: scale(.5) rotate(90deg) } }

.sj.pop .body  { animation: sj-squash .9s cubic-bezier(.3,.7,.3,1) both; }
.sj.pop .stars { animation: sj-jiggle .9s ease-out both; }
.sj.pop .lid   { animation: sj-lid-pop 1.05s cubic-bezier(.3,.7,.35,1) both; }
.sj.pop .hero  { animation: sj-hero-shoot 1.05s cubic-bezier(.25,.8,.3,1) both; }
.sj.pop .spark { animation: sj-spark-burst .9s ease-out both; }

@keyframes sj-squash {
  0%   { transform: scale(1,1) }
  18%  { transform: scale(1.06,.9) }
  38%  { transform: scale(.95,1.08) }
  58%  { transform: scale(1.02,.98) }
  100% { transform: scale(1,1) }
}
@keyframes sj-jiggle {
  0%,15% { transform: translateY(0) rotate(0) }
  35%  { transform: translateY(-4%) rotate(-2deg) }
  55%  { transform: translateY(1%) rotate(1deg) }
  75%  { transform: translateY(-.6%) rotate(-.4deg) }
  100% { transform: translateY(0) rotate(0) }
}
@keyframes sj-lid-pop {
  0%   { transform: translate(0,0) rotate(0) }
  15%  { transform: translate(0,1%) rotate(0) }
  42%  { transform: translate(-4%,-16%) rotate(-24deg) }
  62%  { transform: translate(-1%,-4%) rotate(-4deg) }
  72%  { transform: translate(0,0) rotate(0) }
  80%  { transform: translate(0,-3%) rotate(-2deg) }
  90%,100% { transform: translate(0,0) rotate(0) }
}
@keyframes sj-hero-shoot {
  0%   { transform: translate(0,0) rotate(0) scale(1) }
  15%  { transform: translate(0,2%) rotate(0) scale(.94) }
  45%  { transform: translate(-3%,-20%) rotate(260deg) scale(1.2) }
  70%  { transform: translate(0,1%) rotate(360deg) scale(.97) }
  82%  { transform: translate(0,-3%) rotate(360deg) scale(1.02) }
  100% { transform: translate(0,0) rotate(360deg) scale(1) }
}
@keyframes sj-spark-burst {
  0%,20% { transform: scale(1) rotate(0) }
  40%  { transform: scale(1.7) rotate(40deg) }
  65%  { transform: scale(.9) rotate(60deg) }
  100% { transform: scale(1) rotate(72deg) }
}
@keyframes sj-hero-reduced {
  0%   { transform: scale(1); opacity: 1 }
  50%  { transform: scale(1.18); opacity: 1 }
  100% { transform: scale(1); opacity: 1 }
}

@media (prefers-reduced-motion: reduce) {
  .sj, .sj * { animation: none !important; }
  .sj.pop .hero { animation: sj-hero-reduced .35s ease both !important; }
}

.sj-loop { position: relative; width: 100%; height: 100%; aspect-ratio: 1; overflow: visible; }
.sj-loop video, .sj-loop img { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
.sj-static { width: 100%; height: 100%; aspect-ratio: 1; }
.sj-static img { width: 100%; height: 100%; object-fit: contain; display: block; pointer-events: none; }
`;
