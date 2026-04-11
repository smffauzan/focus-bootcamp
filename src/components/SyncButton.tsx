import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SyncButtonProps {
  syncing: boolean;
  onSync: () => void;
}

export function SyncButton({ syncing, onSync }: SyncButtonProps) {
  return (
    <Button
      onClick={onSync}
      disabled={syncing}
      className="bg-primary hover:bg-primary/80 font-mono text-xs uppercase tracking-wider"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync to Sheets"}
    </Button>
  );
}
