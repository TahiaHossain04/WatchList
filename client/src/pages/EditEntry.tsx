import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EntryForm } from "../components/forms/EntryForm";
import { PageHeader } from "../components/layout/PageHeader";
import { CandyButton, CandyLink } from "../components/ui/CandyButton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { LoadingBubbles } from "../components/ui/LoadingBubbles";
import { StateMessage } from "../components/ui/StateMessage";
import { useToast } from "../contexts/ToastContext";
import { useEntry } from "../hooks/useEntry";
import { deleteEntry, updateEntry } from "../services/entriesApi";
import { collectionPath } from "../utils/labels";

/** /admin/edit/:id — change anything about an entry, including its status. */
export default function EditEntry() {
  const { id } = useParams();
  const { entry, loading, error, notFound } = useEntry(id);
  const navigate = useNavigate();
  const showToast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  if (loading) return <LoadingBubbles />;
  if (notFound || !entry) {
    return (
      <StateMessage
        tone={error ? "error" : "empty"}
        title={error ? "Something went wrong." : "That title isn’t on the shelf."}
        message={error ?? undefined}
        action={<CandyLink to="/">Back home</CandyLink>}
      />
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEntry(entry.id);
      showToast(`“${entry.title}” removed`);
      navigate(collectionPath(entry.status, entry.collection), { replace: true });
    } catch (err) {
      showToast((err as Error).message, "error");
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <PageHeader title="Edit Entry" subtitle={entry.title} />
      <EntryForm
        initial={entry}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await updateEntry(entry.id, payload);
          showToast("Saved ♡");
          navigate(`/entry/${entry.id}`);
        }}
        onCancel={() => navigate(`/entry/${entry.id}`)}
      />
      <div className="mx-auto mt-10 flex max-w-3xl justify-center">
        <CandyButton variant="ghost" onClick={() => setConfirmOpen(true)}>
          Delete this entry
        </CandyButton>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete “${entry.title}”?`}
        message="This action cannot be undone."
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={closeConfirm}
      />
    </>
  );
}
