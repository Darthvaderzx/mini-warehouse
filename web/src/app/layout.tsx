import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiniWarehouse â Back Office',
  description: 'Multi-tenant Back Office Warehouse Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
