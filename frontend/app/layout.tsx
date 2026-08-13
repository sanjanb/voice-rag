export const metadata = {
  title: "VoiceRAG",
  description: "Voice-enabled Retrieval-Augmented Generation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
