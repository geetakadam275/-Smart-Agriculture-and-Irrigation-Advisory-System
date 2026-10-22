import './globals.css';

export const metadata = {
  title: 'Smart Agriculture and Irrigation Advisory System – Simulation',
  description: 'IoT-based smart irrigation simulation dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
