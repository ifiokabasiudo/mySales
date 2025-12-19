import useOfflineSync from "../hooks/useOfflineSync";

export default function MainSync() {
  const { isSyncing } = useOfflineSync();

  return (
    isSyncing && (
      <div className="fixed top-0 left-0 w-full bg-yellow-200 p-2 text-center z-50">
        Syncing...
      </div>
    )
  );
}
