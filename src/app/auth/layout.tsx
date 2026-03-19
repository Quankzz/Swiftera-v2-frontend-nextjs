import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${montserrat.className} flex min-h-screen items-center justify-center bg-linear-to-r from-[#e2e2e2] to-[#c9d6ff]`}
    >
      {children}
    </div>
  );
}
