"use client";

import Image from "next/image";

const BRANDS = [
  { name: "Apple", domain: "apple.com" },
  { name: "Samsung", domain: "samsung.com" },
  { name: "Dell", domain: "dell.com" },
  { name: "Lenovo", domain: "lenovo.com" },
  { name: "ASUS", domain: "asus.com" },
  { name: "Sony", domain: "sony.com" },
  { name: "Acer", domain: "acer.com" },
  { name: "HP", domain: "hp.com" },
];

function logoUrl(domain: string) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ?? "";
  return `https://img.logo.dev/${domain}?token=${token}&size=160&format=png`;
}

export function BrandStrip() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/40 bg-white/80 shadow-sm [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-2 px-6 py-5">
        {BRANDS.map((brand) => (
          <div
            key={brand.domain}
            className="group flex min-w-28 flex-col items-center gap-3 rounded-xl px-5 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="relative size-14 overflow-hidden">
              <Image
                src={logoUrl(brand.domain)}
                alt={brand.name}
                fill
                sizes="56px"
                className="object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                unoptimized
              />
            </div>
            <span className="text-xs font-semibold text-text-sub transition-colors group-hover:text-text-main">
              {brand.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
