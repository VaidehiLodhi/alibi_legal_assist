import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

const kernFont = localFont({
  src: "../fonts/kern_regular.ttf",
});

const shinkaFont = localFont({
  src: "../fonts/shinkamono_thin.woff",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export default function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <html lang="en" className={`${shinkaFont.className} ${ibmPlexMono.className}`}>
        <body>{children}</body>
      </html>
  );
}
