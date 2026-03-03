import { useRef } from "react";
import type { PlayerProfile } from "../backend.d";

interface GradeCertificateProps {
  profile: PlayerProfile;
  gradeGroup: string;
  onClose: () => void;
}

function drawCertificate(
  canvas: HTMLCanvasElement,
  profile: PlayerProfile,
  gradeGroup: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Background — deep dark neon
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#040d1a");
  bgGrad.addColorStop(0.5, "#060b22");
  bgGrad.addColorStop(1, "#030a14");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Outer border (double line neon)
  const borderInset = 20;
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 16;
  ctx.strokeRect(
    borderInset,
    borderInset,
    W - borderInset * 2,
    H - borderInset * 2,
  );

  ctx.strokeStyle = "rgba(0,229,255,0.25)";
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.strokeRect(
    borderInset + 8,
    borderInset + 8,
    W - (borderInset + 8) * 2,
    H - (borderInset + 8) * 2,
  );

  // Corner stars
  const corners = [
    [borderInset + 4, borderInset + 4],
    [W - borderInset - 4, borderInset + 4],
    [borderInset + 4, H - borderInset - 4],
    [W - borderInset - 4, H - borderInset - 4],
  ];
  ctx.fillStyle = "#00e5ff";
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 10;
  ctx.font = "18px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const [cx, cy] of corners) {
    ctx.fillText("★", cx, cy);
  }

  // Header — MELTING MATHS
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00e5ff";
  ctx.fillStyle = "#00e5ff";
  ctx.font = "bold 28px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MELTING MATHS", W / 2, 70);

  // Sub brand line
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(0,229,255,0.5)";
  ctx.font = "13px 'Outfit', sans-serif";
  ctx.fillText("Math Gaming Platform", W / 2, 92);

  // Horizontal divider
  const divGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
  divGrad.addColorStop(0, "transparent");
  divGrad.addColorStop(0.3, "#00e5ff");
  divGrad.addColorStop(0.7, "#9c6bff");
  divGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 108);
  ctx.lineTo(W - 60, 108);
  ctx.stroke();

  // CERTIFICATE OF COMPLETION
  ctx.shadowBlur = 12;
  ctx.shadowColor = "#9c6bff";
  ctx.fillStyle = "#c4a8ff";
  ctx.font = "bold 16px 'Bricolage Grotesque', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 138);
  ctx.letterSpacing = "0px";

  // "This certifies that"
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(200,210,255,0.6)";
  ctx.font = "italic 14px Georgia, serif";
  ctx.fillText("This certifies that", W / 2, 175);

  // Student Name
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00e5ff";
  const nameGrad = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0);
  nameGrad.addColorStop(0, "#7fffd4");
  nameGrad.addColorStop(0.5, "#00e5ff");
  nameGrad.addColorStop(1, "#a8bfff");
  ctx.fillStyle = nameGrad;
  ctx.font = "bold 36px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(profile.name, W / 2, 218);

  // Name underline
  const nameWidth = ctx.measureText(profile.name).width;
  const lineGrad = ctx.createLinearGradient(
    W / 2 - nameWidth / 2,
    0,
    W / 2 + nameWidth / 2,
    0,
  );
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.5, "#00e5ff");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameWidth / 2, 228);
  ctx.lineTo(W / 2 + nameWidth / 2, 228);
  ctx.stroke();

  // "has successfully completed"
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(200,210,255,0.6)";
  ctx.font = "italic 14px Georgia, serif";
  ctx.fillText("has successfully completed all games in", W / 2, 255);

  // Grade Group name
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#f59e0b";
  const gradeGrad = ctx.createLinearGradient(W / 2 - 140, 0, W / 2 + 140, 0);
  gradeGrad.addColorStop(0, "#fde68a");
  gradeGrad.addColorStop(0.5, "#f59e0b");
  gradeGrad.addColorStop(1, "#fde68a");
  ctx.fillStyle = gradeGrad;
  ctx.font = "bold 26px 'Bricolage Grotesque', sans-serif";
  ctx.fillText(`Grade ${gradeGroup} Mathematics`, W / 2, 292);

  // Stars decoration
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#f59e0b";
  ctx.fillStyle = "#fde68a";
  ctx.font = "22px serif";
  const starLine = "★ ★ ★ ★ ★";
  ctx.fillText(starLine, W / 2, 322);

  // Second divider
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(80, 342);
  ctx.lineTo(W - 80, 342);
  ctx.stroke();

  // Date issued
  ctx.fillStyle = "rgba(180,200,255,0.5)";
  ctx.font = "12px 'Outfit', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Date Issued:", 80, 372);
  ctx.fillStyle = "rgba(180,200,255,0.85)";
  ctx.font = "bold 12px 'Outfit', sans-serif";
  ctx.fillText(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    80,
    388,
  );

  // Grade & XP info
  ctx.fillStyle = "rgba(180,200,255,0.5)";
  ctx.font = "12px 'Outfit', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Total XP Earned:", W - 80, 372);
  ctx.fillStyle = "rgba(0,229,255,0.9)";
  ctx.font = "bold 12px 'Outfit', sans-serif";
  ctx.fillText(`${Number(profile.xp).toLocaleString()} XP`, W - 80, 388);

  // Footer
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(120,140,200,0.4)";
  ctx.font = "11px 'Outfit', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Built with ❤️ using caffeine.ai", W / 2, H - 32);
}

export function GradeCertificate({
  profile,
  gradeGroup,
  onClose,
}: GradeCertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCertificate(canvas, profile, gradeGroup);
    const link = document.createElement("a");
    link.download = `melting-maths-certificate-grade-${gradeGroup}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.09 0.02 265), oklch(0.07 0.015 280))",
        border: "1px solid oklch(0.82 0.18 70 / 0.4)",
        boxShadow: "0 0 30px oklch(0.82 0.18 70 / 0.15)",
      }}
      data-ocid="certificate.panel"
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">🎓</div>
        <div>
          <div
            className="font-display font-black text-base"
            style={{ color: "oklch(0.9 0.18 70)" }}
          >
            Grade {gradeGroup} Certificate
          </div>
          <div className="text-muted-foreground text-xs">
            Download your certificate of completion
          </div>
        </div>
      </div>

      {/* Hidden canvas for rendering - not interactive, purely for pixel generation */}
      <canvas ref={canvasRef} width={600} height={420} className="hidden" />

      {/* Preview box */}
      <div
        className="rounded-xl p-4 text-center"
        style={{
          background: "oklch(0.06 0.01 265)",
          border: "1px solid oklch(0.82 0.18 70 / 0.2)",
        }}
      >
        <div className="text-3xl mb-1">📜</div>
        <div className="font-display text-sm font-bold text-foreground">
          {profile.name}
        </div>
        <div className="text-xs" style={{ color: "oklch(0.82 0.18 70)" }}>
          Grade {gradeGroup} Mathematics
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 py-3 rounded-xl font-display font-bold text-sm transition-all hover:scale-[1.02]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.2 0.06 70 / 0.8), oklch(0.15 0.04 50))",
            border: "1px solid oklch(0.82 0.18 70 / 0.6)",
            color: "oklch(0.92 0.18 70)",
            boxShadow: "0 0 20px oklch(0.82 0.18 70 / 0.2)",
          }}
          data-ocid="certificate.download_button"
        >
          ⬇ Download PNG
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "oklch(0.12 0.02 265)",
            border: "1px solid oklch(0.3 0.06 270 / 0.5)",
            color: "oklch(0.6 0.04 270)",
          }}
          data-ocid="certificate.close_button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
