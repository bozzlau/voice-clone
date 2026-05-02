import { ApiKeyForm } from "@/components/settings/ApiKeyForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-xl py-8">
      <h2 className="mb-6 text-2xl font-semibold">Settings</h2>
      <ApiKeyForm />
    </div>
  );
}
