"use client";

import { useCallback, useId, useRef, useState, useEffect } from "react";
import { hslToHex, hslToRgb, hexToHsl, type HSLColor } from "@/lib/color-utils";
import { cn } from "@/lib/utils";

export interface ColorPickerProps {
  /** Label text shown above the picker */
  label: string;
  /** Current HSL color value */
  value: HSLColor;
  /** Callback when color changes */
  onChange: (color: HSLColor) => void;
  /** Optional description text */
  description?: string;
  /** Additional className for the container */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function ColorPicker({
  label,
  value,
  onChange,
  description,
  className,
  disabled = false,
}: ColorPickerProps) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleHueChange = useCallback(
    (newHue: number) => {
      onChange({ ...value, h: newHue });
    },
    [onChange, value]
  );

  const handleSaturationLightnessChange = useCallback(
    (newSat: number, newLight: number) => {
      onChange({ ...value, s: newSat, l: newLight });
    },
    [onChange, value]
  );

  const currentColor = hslToHex(value);

  return (
    <div className={cn("relative space-y-2", className)} ref={containerRef}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none text-foreground"
      >
        {label}
      </label>

      {/* Color swatch button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-full cursor-pointer rounded-md border border-input p-1",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-shadow hover:shadow-md"
        )}
      >
        <div
          className="h-full w-full rounded"
          style={{ backgroundColor: currentColor }}
        />
      </button>

      {/* Custom color picker popup */}
      {isOpen && !disabled && (
        <ColorPickerPopup
          value={value}
          onHueChange={handleHueChange}
          onSaturationLightnessChange={handleSaturationLightnessChange}
          onColorChange={onChange}
        />
      )}

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * Color picker popup with editable values
 */
interface ColorPickerPopupProps {
  value: HSLColor;
  onHueChange: (hue: number) => void;
  onSaturationLightnessChange: (saturation: number, lightness: number) => void;
  onColorChange?: (color: HSLColor) => void;
}

function ColorPickerPopup({
  value,
  onHueChange,
  onSaturationLightnessChange,
  onColorChange,
}: ColorPickerPopupProps) {
  const currentHex = hslToHex(value);
  const currentRgb = hslToRgb(value);

  // Local state for editable inputs
  const [hexInput, setHexInput] = useState(currentHex.toUpperCase());
  const [rgbInput, setRgbInput] = useState(`${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}`);
  const [hslInput, setHslInput] = useState(`${value.h}, ${value.s}, ${value.l}`);

  // Update local inputs when value changes externally
  useEffect(() => {
    setHexInput(currentHex.toUpperCase());
    setRgbInput(`${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}`);
    setHslInput(`${value.h}, ${value.s}, ${value.l}`);
  }, [currentHex, currentRgb.r, currentRgb.g, currentRgb.b, value.h, value.s, value.l]);

  // Handle HEX input change
  const handleHexChange = (input: string) => {
    setHexInput(input);
    const hex = input.startsWith("#") ? input : `#${input}`;
    if (/^#[A-Fa-f0-9]{6}$/.test(hex)) {
      const hsl = hexToHsl(hex);
      if (onColorChange) {
        onColorChange(hsl);
      } else {
        onHueChange(hsl.h);
        onSaturationLightnessChange(hsl.s, hsl.l);
      }
    }
  };

  // Handle RGB input change
  const handleRgbChange = (input: string) => {
    setRgbInput(input);
    const parts = input.split(/[\s,]+/).map(Number);
    if (parts.length >= 3 && parts.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
      const [r, g, b] = parts;
      // Convert RGB to HSL
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const max = Math.max(rNorm, gNorm, bNorm);
      const min = Math.min(rNorm, gNorm, bNorm);
      const l = (max + min) / 2;
      let h = 0, s = 0;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
          case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
          case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
        }
      }
      const hsl: HSLColor = {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      };
      if (onColorChange) {
        onColorChange(hsl);
      } else {
        onHueChange(hsl.h);
        onSaturationLightnessChange(hsl.s, hsl.l);
      }
    }
  };

  // Handle HSL input change
  const handleHslChange = (input: string) => {
    setHslInput(input);
    const parts = input.split(/[\s,°%]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.every(n => !isNaN(n))) {
      const [h, s, l] = parts;
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        const hsl: HSLColor = { h, s, l };
        if (onColorChange) {
          onColorChange(hsl);
        } else {
          onHueChange(h);
          onSaturationLightnessChange(s, l);
        }
      }
    }
  };

  const inputClass = "flex-1 rounded bg-muted px-2 py-1 font-mono text-xs border-0 focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border bg-popover p-3 shadow-lg">
      {/* Saturation/Lightness area */}
      <SaturationLightnessArea
        hue={value.h}
        saturation={value.s}
        lightness={value.l}
        onChange={onSaturationLightnessChange}
      />

      {/* Hue slider */}
      <HueSlider hue={value.h} onChange={onHueChange} />

      {/* Editable color values */}
      <div className="mt-3 space-y-1.5">
        {/* HEX */}
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] font-medium text-muted-foreground">HEX</span>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className={inputClass}
            placeholder="#000000"
            maxLength={7}
          />
        </div>
        {/* RGB */}
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] font-medium text-muted-foreground">RGB</span>
          <input
            type="text"
            value={rgbInput}
            onChange={(e) => handleRgbChange(e.target.value)}
            className={inputClass}
            placeholder="0, 0, 0"
          />
        </div>
        {/* HSL */}
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] font-medium text-muted-foreground">HSL</span>
          <input
            type="text"
            value={hslInput}
            onChange={(e) => handleHslChange(e.target.value)}
            className={inputClass}
            placeholder="0, 0, 0"
          />
        </div>
      </div>

      {/* Preview swatch */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="h-6 flex-1 rounded border"
          style={{ backgroundColor: currentHex }}
        />
      </div>
    </div>
  );
}

/**
 * Saturation/Lightness picker area
 */
interface SaturationLightnessAreaProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (saturation: number, lightness: number) => void;
}

function SaturationLightnessArea({
  hue,
  saturation,
  lightness,
  onChange,
}: SaturationLightnessAreaProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (!areaRef.current) return;

      const rect = areaRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

      const newSat = Math.round((x / rect.width) * 100);
      // Invert Y: top = 100% lightness, bottom = 0%
      const newLight = Math.round(100 - (y / rect.height) * 100);

      onChange(newSat, newLight);
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  // Calculate cursor position
  const cursorX = (saturation / 100) * 100;
  const cursorY = 100 - lightness;

  return (
    <div
      ref={areaRef}
      className="relative h-40 w-56 cursor-crosshair rounded overflow-hidden"
      onMouseDown={handleMouseDown}
      style={{
        background: `
          linear-gradient(to top, #000, transparent),
          linear-gradient(to right, #fff, transparent),
          hsl(${hue}, 100%, 50%)
        `,
      }}
    >
      {/* Cursor indicator */}
      <div
        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `${cursorX}%`,
          top: `${cursorY}%`,
          backgroundColor: hslToHex({ h: hue, s: saturation, l: lightness }),
        }}
      />
    </div>
  );
}

/**
 * Hue slider
 */
interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

function HueSlider({ hue, onChange }: HueSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const newHue = Math.round((x / rect.width) * 360);

      onChange(newHue);
    },
    [onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleInteraction(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleInteraction]);

  const cursorPosition = (hue / 360) * 100;

  return (
    <div
      ref={sliderRef}
      className="relative mt-3 h-4 w-56 cursor-pointer rounded overflow-hidden"
      onMouseDown={handleMouseDown}
      style={{
        background: `linear-gradient(to right, 
          hsl(0, 100%, 50%),
          hsl(60, 100%, 50%),
          hsl(120, 100%, 50%),
          hsl(180, 100%, 50%),
          hsl(240, 100%, 50%),
          hsl(300, 100%, 50%),
          hsl(360, 100%, 50%)
        )`,
      }}
    >
      {/* Hue cursor */}
      <div
        className="absolute top-0 h-full w-2 -translate-x-1/2 rounded border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `${cursorPosition}%`,
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
        }}
      />
    </div>
  );
}

/**
 * Compact color picker variant for tighter layouts
 */
export interface CompactColorPickerProps {
  label: string;
  value: HSLColor;
  onChange: (color: HSLColor) => void;
  className?: string;
}

export function CompactColorPicker({
  label,
  value,
  onChange,
  className,
}: CompactColorPickerProps) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleHueChange = useCallback(
    (newHue: number) => {
      onChange({ ...value, h: newHue });
    },
    [onChange, value]
  );

  const handleSaturationLightnessChange = useCallback(
    (newSat: number, newLight: number) => {
      onChange({ ...value, s: newSat, l: newLight });
    },
    [onChange, value]
  );

  const currentColor = hslToHex(value);

  return (
    <div className={cn("relative flex items-center gap-2", className)} ref={containerRef}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 w-8 cursor-pointer rounded border border-input p-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div
          className="h-full w-full rounded-sm"
          style={{ backgroundColor: currentColor }}
        />
      </button>
      <label
        htmlFor={id}
        className="text-xs font-medium leading-none text-foreground"
      >
        {label}
      </label>

      {isOpen && (
        <ColorPickerPopup
          value={value}
          onHueChange={handleHueChange}
          onSaturationLightnessChange={handleSaturationLightnessChange}
          onColorChange={onChange}
        />
      )}
    </div>
  );
}
