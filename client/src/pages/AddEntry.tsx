import { useNavigate, useSearchParams } from "react-router-dom";
import { EntryForm } from "../components/forms/EntryForm";
import { PageHeader } from "../components/layout/PageHeader";
import { useToast } from "../contexts/ToastContext";
import { createEntry } from "../services/entriesApi";
import type { Collection, WatchStatus } from "../types/entry";
import { COLLECTION_INFO, STATUS_BY_VALUE } from "../utils/labels";

/** /admin/add — create a new entry. `?status=watching&collection=korean` pre-selects those. */
export default function AddEntry() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [params] = useSearchParams();
  const statusParam = params.get("status") as WatchStatus | null;
  const status = statusParam && statusParam in STATUS_BY_VALUE ? statusParam : "watched";
  const collectionParam = params.get("collection") as Collection | null;
  const collection = collectionParam && collectionParam in COLLECTION_INFO ? collectionParam : undefined;

  return (
    <>
      <PageHeader title="Add Entry" subtitle="Another one for the shelf ♡" />
      <EntryForm
        initial={{ status, collection }}
        submitLabel="Add to the shelf"
        onSubmit={async (payload) => {
          const entry = await createEntry(payload);
          showToast(`“${entry.title}” added ♡`);
          navigate(`/entry/${entry.id}`);
        }}
        onCancel={() => navigate(-1)}
      />
    </>
  );
}
