import { VoiceUploadForm } from "@/components/voices/VoiceUploadForm";

export default function NewVoicePage() {
  return (
    <div className="py-8">
      <h2 className="mb-6 text-2xl font-semibold">Create Voice Model</h2>
      <VoiceUploadForm />
    </div>
  );
}
