"use client";

import { useState } from "react";
import { Palette, ChevronDown } from "lucide-react";

const DEFAULT_COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#B7B7B7",
  "#CCCCCC",
  "#D9D9D9",
  "#EFEFEF",
  "#F3F3F3",
  "#FFFFFF",
  "#980000",
  "#FF0000",
  "#FF9900",
  "#FFFF00",
  "#00FF00",
  "#00FFFF",
  "#4A86E8",
  "#0000FF",
  "#9900FF",
  "#FF00FF",
  "#E6B8AF",
  "#F4CCCC",
  "#FCE5CD",
  "#FFF2CC",
  "#D9EAD3",
  "#D0E0E3",
  "#C9DAF8",
  "#CFE2F3",
  "#D9D2E9",
  "#EAD1DC",
  "#DD7E6B",
  "#EA9999",
  "#F9CB9C",
  "#FFE599",
  "#B6D7A8",
  "#A2C4C9",
  "#A4C2F4",
  "#9FC5E8",
  "#B4A7D6",
  "#D5A6BD",
  "#CC4125",
  "#E06666",
  "#F6B26B",
  "#FFD966",
  "#93C47D",
  "#76A5AF",
  "#6D9EEB",
  "#6FA8DC",
  "#8E7CC3",
  "#C27BA0",
  "#A61C00",
  "#CC0000",
  "#E69138",
  "#F1C232",
  "#6AA84F",
  "#45818E",
  "#3C78D8",
  "#3D85C6",
  "#674EA7",
  "#A64D79",
  "#85200C",
  "#990000",
  "#B45F06",
  "#BF9000",
  "#38761D",
  "#134F5C",
  "#1155CC",
  "#0B5394",
  "#351C75",
  "#741B47",
  "#5B0F00",
  "#660000",
  "#783F04",
  "#7F6000",
  "#274E13",
  "#0C343D",
  "#1C4587",
  "#073763",
  "#20124D",
  "#4C1130",
];

const EXTENDED_COLORS = [
  "#FFC0CB",
  "#FFB6C1",
  "#FF69B4",
  "#FF1493",
  "#C71585",
  "#DB7093",
  "#DC143C",
  "#B22222",
  "#8B0000",
  "#800000",
  "#FFA07A",
  "#FF8C00",
  "#FF7F50",
  "#FF6347",
  "#FF4500",
  "#D2691E",
  "#A0522D",
  "#8B4513",
  "#800020",
  "#654321",
  "#FFFACD",
  "#FAFAD2",
  "#FFE4B5",
  "#FFDAB9",
  "#EEE8AA",
  "#F0E68C",
  "#BDB76B",
  "#DAA520",
  "#B8860B",
  "#FFD700",
  "#90EE90",
  "#98FB98",
  "#8FBC8F",
  "#3CB371",
  "#2E8B57",
  "#228B22",
  "#008000",
  "#006400",
  "#556B2F",
  "#808000",
  "#E0FFFF",
  "#AFEEEE",
  "#7FFFD4",
  "#40E0D0",
  "#48D1CC",
  "#00CED1",
  "#20B2AA",
  "#008B8B",
  "#008080",
  "#2F4F4F",
  "#ADD8E6",
  "#87CEEB",
  "#87CEFA",
  "#00BFFF",
  "#1E90FF",
  "#6495ED",
  "#4169E1",
  "#0000CD",
  "#00008B",
  "#000080",
  "#E6E6FA",
  "#D8BFD8",
  "#DDA0DD",
  "#EE82EE",
  "#DA70D6",
  "#FF00FF",
  "#BA55D3",
  "#9370DB",
  "#8A2BE2",
  "#4B0082",
  "#F5F5DC",
  "#FFE4C4",
  "#FFDEAD",
  "#F5DEB3",
  "#DEB887",
  "#D2B48C",
  "#BC8F8F",
  "#F4A460",
  "#CD853F",
  "#8B4513",
];

interface ColorPickerProps {
  onColorSelect: (color: string) => void;
}

export default function ColorPicker({ onColorSelect }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onColorSelect(color);
  };

  const displayedColors = showMore
    ? [...DEFAULT_COLORS, ...EXTENDED_COLORS]
    : DEFAULT_COLORS;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // keep editor focus
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border/60 dark:border-white/8 bg-white dark:bg-surface-card rounded-md text-sm text-text-main hover:bg-gray-50 dark:hover:bg-white/8 transition-colors"
        title="Màu chữ"
      >
        <Palette className="w-4 h-4 text-text-sub" />
        <span
          className="w-4 h-4 rounded border border-black/10 dark:border-white/15 shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <ChevronDown
          className={`w-3 h-3 text-text-sub transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-surface-card border border-border/60 dark:border-white/8 rounded-xl shadow-xl dark:shadow-black/40 z-20 w-72">
            <p className="text-xs font-medium text-text-sub mb-2">Màu chữ</p>
            <div className="grid grid-cols-10 gap-1">
              {displayedColors.map((color, i) => (
                <button
                  key={`${color}-${i}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // keep editor focus
                    handleColorClick(color);
                    setIsOpen(false);
                  }}
                  className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                    selectedColor === color
                      ? "border-theme-primary-start ring-2 ring-theme-primary-start/30"
                      : "border-black/10 dark:border-white/10"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {!showMore && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowMore(true);
                }}
                className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-theme-primary-start hover:bg-theme-primary-start/8 rounded-lg transition-colors"
              >
                Xem thêm màu
              </button>
            )}

            <div className="mt-3 pt-3 border-t border-border/40 dark:border-white/8 flex items-center gap-2">
              <span className="text-xs text-text-sub">Tùy chỉnh:</span>
              <input
                type="color"
                value={selectedColor}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => handleColorClick(e.target.value)}
                className="w-7 h-7 rounded border border-border/60 dark:border-white/8 cursor-pointer"
              />
              <span className="text-xs font-mono text-text-sub">
                {selectedColor.toUpperCase()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
