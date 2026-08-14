import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  Check,
  Clipboard,
  Download,
  ImagePlus,
  Link2,
  Mail,
  Palette,
  Phone,
  QrCode,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Type,
  Upload,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ContentType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "event"
  | "whatsapp"
  | "crypto";

type DotType = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
type CornerSquareType = "square" | "dot" | "extra-rounded";
type CornerDotType = "square" | "dot";
type ErrorCorrection = "L" | "M" | "Q" | "H";
type ExportType = "png" | "jpeg" | "webp" | "svg";

type QRCodeStylingInstance = {
  append: (container?: HTMLElement | null) => void;
  update: (options: Record<string, unknown>) => void;
  download: (options: { name: string; extension: ExportType }) => Promise<void>;
  getRawData: (extension: ExportType) => Promise<Blob | null>;
};

type ContentState = {
  url: string;
  text: string;
  email: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  smsNumber: string;
  smsMessage: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: "WPA" | "WEP" | "nopass";
  wifiHidden: boolean;
  vcardName: string;
  vcardCompany: string;
  vcardTitle: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardWebsite: string;
  eventTitle: string;
  eventLocation: string;
  eventStart: string;
  eventEnd: string;
  whatsappNumber: string;
  whatsappMessage: string;
  cryptoAddress: string;
  cryptoAmount: string;
};

type StyleState = {
  foreground: string;
  foregroundAlt: string;
  background: string;
  useGradient: boolean;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  cornerColor: string;
  size: number;
  margin: number;
  errorCorrection: ErrorCorrection;
  logo: string;
  logoSize: number;
  logoMargin: number;
  hideLogoBackgroundDots: boolean;
};

const contentTypes: Array<{
  value: ContentType;
  label: string;
  icon: typeof Link2;
}> = [
  { value: "url", label: "URL", icon: Link2 },
  { value: "text", label: "Text", icon: Type },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "wifi", label: "Wi-Fi", icon: Wifi },
  { value: "vcard", label: "vCard", icon: QrCode },
  { value: "event", label: "Event", icon: Sparkles },
  { value: "whatsapp", label: "WhatsApp", icon: Smartphone },
  { value: "crypto", label: "Crypto", icon: ShieldCheck },
];

const presets: Array<{ name: string; style: Partial<StyleState> }> = [
  {
    name: "Studio",
    style: {
      foreground: "#1d1d1d",
      foregroundAlt: "#135d66",
      background: "#ffffff",
      useGradient: true,
      dotType: "rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      cornerColor: "#d3542f",
    },
  },
  {
    name: "Mono",
    style: {
      foreground: "#111111",
      foregroundAlt: "#111111",
      background: "#ffffff",
      useGradient: false,
      dotType: "square",
      cornerSquareType: "square",
      cornerDotType: "square",
      cornerColor: "#111111",
    },
  },
  {
    name: "Signal",
    style: {
      foreground: "#0f766e",
      foregroundAlt: "#7c2d12",
      background: "#fff7ed",
      useGradient: true,
      dotType: "classy-rounded",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      cornerColor: "#4338ca",
    },
  },
  {
    name: "Night",
    style: {
      foreground: "#f8fafc",
      foregroundAlt: "#facc15",
      background: "#18181b",
      useGradient: true,
      dotType: "dots",
      cornerSquareType: "dot",
      cornerDotType: "dot",
      cornerColor: "#2dd4bf",
    },
  },
];

const defaultContent: ContentState = {
  url: "https://example.com",
  text: "Create, customize, and export private QR codes.",
  email: "hello@example.com",
  emailSubject: "Hello",
  emailBody: "I scanned your QR code.",
  phone: "+1234567890",
  smsNumber: "+1234567890",
  smsMessage: "Hello from QR Studio",
  wifiSsid: "Studio WiFi",
  wifiPassword: "strong-password",
  wifiEncryption: "WPA",
  wifiHidden: false,
  vcardName: "Ada Lovelace",
  vcardCompany: "Analytical Studio",
  vcardTitle: "Founder",
  vcardPhone: "+1234567890",
  vcardEmail: "ada@example.com",
  vcardWebsite: "https://example.com",
  eventTitle: "Launch Meeting",
  eventLocation: "Lagos",
  eventStart: "2026-08-14T10:00",
  eventEnd: "2026-08-14T11:00",
  whatsappNumber: "+1234567890",
  whatsappMessage: "Hi, I scanned your QR code.",
  cryptoAddress: "bc1qexampleaddress",
  cryptoAmount: "0.01",
};

const defaultStyle: StyleState = {
  foreground: "#1d1d1d",
  foregroundAlt: "#135d66",
  background: "#ffffff",
  useGradient: true,
  dotType: "rounded",
  cornerSquareType: "extra-rounded",
  cornerDotType: "dot",
  cornerColor: "#d3542f",
  size: 720,
  margin: 24,
  errorCorrection: "Q",
  logo: "",
  logoSize: 0.22,
  logoMargin: 8,
  hideLogoBackgroundDots: true,
};

const storageKey = "qr-studio-state";

function encode(value: string) {
  return encodeURIComponent(value.trim());
}

function escapeWifi(value: string) {
  return value.replace(/([\\;,":])/g, "\\$1");
}

function formatDateForIcs(value: string) {
  if (!value) return "";
  return value.replace(/[-:]/g, "").replace(".000", "").replace(/\.\d+/, "");
}

function buildPayload(type: ContentType, content: ContentState) {
  switch (type) {
    case "url":
      return content.url.trim() || "https://example.com";
    case "text":
      return content.text.trim() || " ";
    case "email":
      return `mailto:${content.email.trim()}?subject=${encode(content.emailSubject)}&body=${encode(
        content.emailBody,
      )}`;
    case "phone":
      return `tel:${content.phone.trim()}`;
    case "sms":
      return `SMSTO:${content.smsNumber.trim()}:${content.smsMessage.trim()}`;
    case "wifi":
      return `WIFI:T:${content.wifiEncryption};S:${escapeWifi(content.wifiSsid)};P:${escapeWifi(
        content.wifiPassword,
      )};H:${content.wifiHidden ? "true" : "false"};;`;
    case "vcard":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${content.vcardName}`,
        `ORG:${content.vcardCompany}`,
        `TITLE:${content.vcardTitle}`,
        `TEL:${content.vcardPhone}`,
        `EMAIL:${content.vcardEmail}`,
        `URL:${content.vcardWebsite}`,
        "END:VCARD",
      ].join("\n");
    case "event":
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${content.eventTitle}`,
        `LOCATION:${content.eventLocation}`,
        `DTSTART:${formatDateForIcs(content.eventStart)}`,
        `DTEND:${formatDateForIcs(content.eventEnd)}`,
        "END:VEVENT",
      ].join("\n");
    case "whatsapp":
      return `https://wa.me/${content.whatsappNumber.replace(/\D/g, "")}?text=${encode(
        content.whatsappMessage,
      )}`;
    case "crypto":
      return `bitcoin:${content.cryptoAddress.trim()}${
        content.cryptoAmount ? `?amount=${encode(content.cryptoAmount)}` : ""
      }`;
  }
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = parseInt(
    normalized.length === 3
      ? normalized
          .split("")
          .map((item) => item + item)
          .join("")
      : normalized,
    16,
  );
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function scoreQr(payload: string, style: StyleState) {
  const contrast = contrastRatio(style.foreground, style.background);
  const warnings: string[] = [];
  let score = 100;

  if (contrast < 7) {
    score -= contrast < 4.5 ? 28 : 12;
    warnings.push("Increase contrast for easier scanning.");
  }

  if (style.logo && style.logoSize > 0.24 && style.errorCorrection !== "H") {
    score -= 18;
    warnings.push("Use H error correction with large logos.");
  }

  if (style.margin < 16) {
    score -= 12;
    warnings.push("Add more quiet-zone margin.");
  }

  if (payload.length > 250) {
    score -= 10;
    warnings.push("Shorter content makes denser codes scan faster.");
  }

  if (style.background.toLowerCase() !== "#ffffff" && style.errorCorrection === "L") {
    score -= 8;
    warnings.push("Raise error correction for styled backgrounds.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    contrast: Number(contrast.toFixed(1)),
    warnings,
  };
}

function App() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStylingInstance | null>(null);
  const [contentType, setContentType] = useState<ContentType>("url");
  const [content, setContent] = useState<ContentState>(defaultContent);
  const [style, setStyle] = useState<StyleState>(defaultStyle);
  const [exportType, setExportType] = useState<ExportType>("png");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedState = window.localStorage.getItem(storageKey);
    if (!savedState) return;
    try {
      const parsed = JSON.parse(savedState) as {
        contentType?: ContentType;
        content?: Partial<ContentState>;
        style?: Partial<StyleState>;
      };
      if (parsed.contentType) setContentType(parsed.contentType);
      if (parsed.content) setContent((current) => ({ ...current, ...parsed.content }));
      if (parsed.style) setStyle((current) => ({ ...current, ...parsed.style }));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const payload = useMemo(() => buildPayload(contentType, content), [contentType, content]);
  const safety = useMemo(() => scoreQr(payload, style), [payload, style]);

  const qrOptions = useMemo(
    () => ({
      width: style.size,
      height: style.size,
      type: "svg" as const,
      data: payload,
      image: style.logo || undefined,
      margin: style.margin,
      qrOptions: {
        errorCorrectionLevel: style.errorCorrection,
      },
      dotsOptions: {
        type: style.dotType,
        color: style.foreground,
        gradient: style.useGradient
          ? {
              type: "linear",
              rotation: 0.78,
              colorStops: [
                { offset: 0, color: style.foreground },
                { offset: 1, color: style.foregroundAlt },
              ],
            }
          : undefined,
      },
      backgroundOptions: {
        color: style.background,
      },
      cornersSquareOptions: {
        type: style.cornerSquareType,
        color: style.cornerColor,
      },
      cornersDotOptions: {
        type: style.cornerDotType,
        color: style.cornerColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        imageSize: style.logoSize,
        margin: style.logoMargin,
        hideBackgroundDots: style.hideLogoBackgroundDots,
      },
    }),
    [payload, style],
  );

  useEffect(() => {
    if (!previewRef.current) return;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(qrOptions as never) as unknown as QRCodeStylingInstance;
      previewRef.current.innerHTML = "";
      qrRef.current.append(previewRef.current);
      return;
    }

    qrRef.current.update(qrOptions as Record<string, unknown>);
  }, [qrOptions]);

  function updateContent<Key extends keyof ContentState>(key: Key, value: ContentState[Key]) {
    setContent((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function updateStyle<Key extends keyof StyleState>(key: Key, value: StyleState[Key]) {
    setStyle((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function downloadQr() {
    await qrRef.current?.download({ name: "qr-studio-code", extension: exportType });
  }

  async function copyQr() {
    if (!qrRef.current || !navigator.clipboard || !("ClipboardItem" in window)) return;
    const blob = await qrRef.current.getRawData("png");
    if (!(blob instanceof Blob)) return;
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function savePreset() {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        contentType,
        content,
        style,
      }),
    );
    setSaved(true);
  }

  function resetAll() {
    setContentType("url");
    setContent(defaultContent);
    setStyle(defaultStyle);
    setSaved(false);
    window.localStorage.removeItem(storageKey);
  }

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") updateStyle("logo", reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto grid min-h-screen w-full max-w-[1480px] gap-6 px-4 py-4 lg:grid-cols-[minmax(360px,520px)_1fr] lg:px-6">
          <section className="flex min-h-0 flex-col gap-4 rounded-lg border border-border bg-white/55 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-normal">QR Studio</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Private browser-based QR creation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={resetAll} aria-label="Reset">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={savePreset} aria-label="Save">
                      {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save locally</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Tabs defaultValue="content" className="min-h-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {contentTypes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        className={cn(
                          "flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-border bg-white/70 text-sm font-medium transition-colors hover:bg-muted",
                          contentType === item.value &&
                            "border-primary bg-primary text-primary-foreground hover:bg-primary",
                        )}
                        onClick={() => setContentType(item.value)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <ContentFields
                  contentType={contentType}
                  content={content}
                  updateContent={updateContent}
                />
              </TabsContent>

              <TabsContent value="design" className="space-y-5">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className="h-16 rounded-md border border-border bg-white/70 px-3 text-left text-sm font-medium hover:bg-muted"
                      onClick={() => setStyle((current) => ({ ...current, ...preset.style }))}
                    >
                      <span>{preset.name}</span>
                      <span
                        className="mt-2 block h-2 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${
                            preset.style.foreground ?? defaultStyle.foreground
                          }, ${preset.style.foregroundAlt ?? preset.style.foreground}, ${
                            preset.style.cornerColor ?? defaultStyle.cornerColor
                          })`,
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    label="Dots"
                    value={style.foreground}
                    onChange={(value) => updateStyle("foreground", value)}
                  />
                  <ColorField
                    label="Accent"
                    value={style.foregroundAlt}
                    onChange={(value) => updateStyle("foregroundAlt", value)}
                  />
                  <ColorField
                    label="Corners"
                    value={style.cornerColor}
                    onChange={(value) => updateStyle("cornerColor", value)}
                  />
                  <ColorField
                    label="Background"
                    value={style.background}
                    onChange={(value) => updateStyle("background", value)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border border-border bg-white/60 p-3">
                  <Label htmlFor="gradient">Gradient dots</Label>
                  <Switch
                    id="gradient"
                    checked={style.useGradient}
                    onCheckedChange={(checked) => updateStyle("useGradient", checked)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <SelectField
                    label="Dot style"
                    value={style.dotType}
                    options={["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"]}
                    onChange={(value) => updateStyle("dotType", value as DotType)}
                  />
                  <SelectField
                    label="Outer eyes"
                    value={style.cornerSquareType}
                    options={["square", "dot", "extra-rounded"]}
                    onChange={(value) => updateStyle("cornerSquareType", value as CornerSquareType)}
                  />
                  <SelectField
                    label="Inner eyes"
                    value={style.cornerDotType}
                    options={["square", "dot"]}
                    onChange={(value) => updateStyle("cornerDotType", value as CornerDotType)}
                  />
                </div>

                <div className="space-y-4 rounded-md border border-border bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="logo-upload" className="flex items-center gap-2">
                      <ImagePlus className="h-4 w-4" />
                      Logo
                    </Label>
                    {style.logo && (
                      <Button variant="ghost" size="sm" onClick={() => updateStyle("logo", "")}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={(event) => handleLogoUpload(event.target.files?.[0])}
                  />
                  {style.logo && (
                    <>
                      <SliderField
                        label="Logo size"
                        value={Math.round(style.logoSize * 100)}
                        min={8}
                        max={30}
                        suffix="%"
                        onChange={(value) => updateStyle("logoSize", value / 100)}
                      />
                      <SliderField
                        label="Logo padding"
                        value={style.logoMargin}
                        min={0}
                        max={24}
                        suffix="px"
                        onChange={(value) => updateStyle("logoMargin", value)}
                      />
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-5">
                <SliderField
                  label="Export size"
                  value={style.size}
                  min={256}
                  max={2048}
                  step={16}
                  suffix="px"
                  onChange={(value) => updateStyle("size", value)}
                />
                <SliderField
                  label="Quiet zone"
                  value={style.margin}
                  min={0}
                  max={80}
                  step={4}
                  suffix="px"
                  onChange={(value) => updateStyle("margin", value)}
                />
                <SelectField
                  label="Error correction"
                  value={style.errorCorrection}
                  options={["L", "M", "Q", "H"]}
                  onChange={(value) => updateStyle("errorCorrection", value as ErrorCorrection)}
                />
                <div className="flex items-center justify-between rounded-md border border-border bg-white/60 p-3">
                  <Label htmlFor="hide-dots">Clear dots behind logo</Label>
                  <Switch
                    id="hide-dots"
                    checked={style.hideLogoBackgroundDots}
                    onCheckedChange={(checked) =>
                      updateStyle("hideLogoBackgroundDots", checked)
                    }
                  />
                </div>
                <div className="rounded-md border border-border bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Scan score</p>
                      <p className="text-sm text-muted-foreground">
                        Contrast {safety.contrast}:1, {payload.length} characters
                      </p>
                    </div>
                    <div className="text-3xl font-semibold">{safety.score}</div>
                  </div>
                  {safety.warnings.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {safety.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Current settings are scanner-friendly.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <section className="flex min-h-[560px] flex-col justify-between gap-5 rounded-lg border border-border bg-[#efe7d8] p-4 shadow-sm lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Preview</p>
                <h2 className="text-xl font-semibold tracking-normal">Export-ready QR code</h2>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={exportType}
                  onChange={(event) => setExportType(event.target.value as ExportType)}
                  className="h-10 rounded-md border border-border bg-white/80 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Export format"
                >
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={copyQr} aria-label="Copy PNG">
                      {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy PNG</TooltipContent>
                </Tooltip>
                <Button onClick={downloadQr}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-[560px] rounded-lg border border-border bg-white p-5 shadow-sm">
                <div
                  ref={previewRef}
                  className="qr-preview aspect-square w-full overflow-hidden rounded-md"
                  aria-label="QR code preview"
                />
              </div>
            </div>

            <div className="grid gap-3 rounded-md border border-border bg-white/55 p-4 text-sm md:grid-cols-3">
              <Metric label="Type" value={contentTypes.find((item) => item.value === contentType)?.label ?? ""} />
              <Metric label="Correction" value={style.errorCorrection} />
              <Metric label="Score" value={`${safety.score}/100`} />
            </div>
          </section>
        </div>
      </main>
    </TooltipProvider>
  );
}

function ContentFields({
  contentType,
  content,
  updateContent,
}: {
  contentType: ContentType;
  content: ContentState;
  updateContent: <Key extends keyof ContentState>(key: Key, value: ContentState[Key]) => void;
}) {
  if (contentType === "url") {
    return (
      <FieldGroup>
        <TextField label="Website URL" value={content.url} onChange={(value) => updateContent("url", value)} />
      </FieldGroup>
    );
  }

  if (contentType === "text") {
    return (
      <FieldGroup>
        <Label htmlFor="text">Text</Label>
        <Textarea id="text" value={content.text} onChange={(event) => updateContent("text", event.target.value)} />
      </FieldGroup>
    );
  }

  if (contentType === "email") {
    return (
      <FieldGroup>
        <TextField label="Email" value={content.email} onChange={(value) => updateContent("email", value)} />
        <TextField
          label="Subject"
          value={content.emailSubject}
          onChange={(value) => updateContent("emailSubject", value)}
        />
        <Label htmlFor="email-body">Body</Label>
        <Textarea
          id="email-body"
          value={content.emailBody}
          onChange={(event) => updateContent("emailBody", event.target.value)}
        />
      </FieldGroup>
    );
  }

  if (contentType === "phone") {
    return (
      <FieldGroup>
        <TextField label="Phone number" value={content.phone} onChange={(value) => updateContent("phone", value)} />
      </FieldGroup>
    );
  }

  if (contentType === "sms") {
    return (
      <FieldGroup>
        <TextField
          label="Phone number"
          value={content.smsNumber}
          onChange={(value) => updateContent("smsNumber", value)}
        />
        <Label htmlFor="sms-message">Message</Label>
        <Textarea
          id="sms-message"
          value={content.smsMessage}
          onChange={(event) => updateContent("smsMessage", event.target.value)}
        />
      </FieldGroup>
    );
  }

  if (contentType === "wifi") {
    return (
      <FieldGroup>
        <TextField label="Network name" value={content.wifiSsid} onChange={(value) => updateContent("wifiSsid", value)} />
        <TextField
          label="Password"
          value={content.wifiPassword}
          onChange={(value) => updateContent("wifiPassword", value)}
        />
        <SelectField
          label="Security"
          value={content.wifiEncryption}
          options={["WPA", "WEP", "nopass"]}
          onChange={(value) => updateContent("wifiEncryption", value as ContentState["wifiEncryption"])}
        />
        <div className="flex items-center justify-between rounded-md border border-border bg-white/60 p-3">
          <Label htmlFor="wifi-hidden">Hidden network</Label>
          <Switch
            id="wifi-hidden"
            checked={content.wifiHidden}
            onCheckedChange={(checked) => updateContent("wifiHidden", checked)}
          />
        </div>
      </FieldGroup>
    );
  }

  if (contentType === "vcard") {
    return (
      <FieldGroup columns>
        <TextField label="Name" value={content.vcardName} onChange={(value) => updateContent("vcardName", value)} />
        <TextField
          label="Company"
          value={content.vcardCompany}
          onChange={(value) => updateContent("vcardCompany", value)}
        />
        <TextField label="Title" value={content.vcardTitle} onChange={(value) => updateContent("vcardTitle", value)} />
        <TextField label="Phone" value={content.vcardPhone} onChange={(value) => updateContent("vcardPhone", value)} />
        <TextField label="Email" value={content.vcardEmail} onChange={(value) => updateContent("vcardEmail", value)} />
        <TextField
          label="Website"
          value={content.vcardWebsite}
          onChange={(value) => updateContent("vcardWebsite", value)}
        />
      </FieldGroup>
    );
  }

  if (contentType === "event") {
    return (
      <FieldGroup columns>
        <TextField label="Title" value={content.eventTitle} onChange={(value) => updateContent("eventTitle", value)} />
        <TextField
          label="Location"
          value={content.eventLocation}
          onChange={(value) => updateContent("eventLocation", value)}
        />
        <DateField label="Starts" value={content.eventStart} onChange={(value) => updateContent("eventStart", value)} />
        <DateField label="Ends" value={content.eventEnd} onChange={(value) => updateContent("eventEnd", value)} />
      </FieldGroup>
    );
  }

  if (contentType === "whatsapp") {
    return (
      <FieldGroup>
        <TextField
          label="Phone number"
          value={content.whatsappNumber}
          onChange={(value) => updateContent("whatsappNumber", value)}
        />
        <Label htmlFor="whatsapp-message">Message</Label>
        <Textarea
          id="whatsapp-message"
          value={content.whatsappMessage}
          onChange={(event) => updateContent("whatsappMessage", event.target.value)}
        />
      </FieldGroup>
    );
  }

  return (
    <FieldGroup>
      <TextField
        label="Bitcoin address"
        value={content.cryptoAddress}
        onChange={(value) => updateContent("cryptoAddress", value)}
      />
      <TextField label="Amount" value={content.cryptoAmount} onChange={(value) => updateContent("cryptoAmount", value)} />
    </FieldGroup>
  );
}

function FieldGroup({
  children,
  columns = false,
}: {
  children: React.ReactNode;
  columns?: boolean;
}) {
  return <div className={cn("grid gap-4", columns && "sm:grid-cols-2")}>{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="grid grid-cols-[44px_1fr] gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-11 cursor-pointer rounded-md border border-border bg-white p-1"
          aria-label={label}
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-white/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([nextValue]) => onChange(nextValue)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-white/80 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

export default App;
