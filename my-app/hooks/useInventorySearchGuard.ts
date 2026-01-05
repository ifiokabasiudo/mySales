export function useInventorySearchGuard(
  isInventoryEmpty: boolean,
  setShowModal: (v: boolean) => void,
  setTable: (v: { tableName: string; link: string }) => void
) {
  return ({ name, link }: { name: string; link: string }) => {
    if (isInventoryEmpty) {
      setShowModal(true);
      setTable({ tableName: name, link });
      return false;
    }

    return true;
  };
}