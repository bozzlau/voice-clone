import { TTSForm } from "@/components/tts/TTSForm";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h2 className="mb-6 text-2xl font-semibold">Text to Speech</h2>
      <TTSForm />
    </div>
  );
}
