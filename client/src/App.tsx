import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { RequireAdmin } from "./components/layout/RequireAdmin";
import Abandoned from "./pages/Abandoned";
import AddEntry from "./pages/AddEntry";
import { CollectionPage } from "./pages/CollectionPage";
import EditEntry from "./pages/EditEntry";
import EntryDetails from "./pages/EntryDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import WantToWatch from "./pages/WantToWatch";
import Watched from "./pages/Watched";
import Watching from "./pages/Watching";

/**
 * All the pages of the site. Home stands alone (no navbar);
 * everything else sits inside <Layout> (navbar + page transition).
 *   /watched            → the TV "channels" (one per collection)
 *   /watched/k-drama    → that collection's shelf
 * The status paths must match `path` in utils/labels.ts; collection slugs come from COLLECTIONS there.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<Layout />}>
        <Route path="/watched" element={<Watched />} />
        <Route path="/watched/:collection" element={<CollectionPage status="watched" />} />
        <Route path="/watching" element={<Watching />} />
        <Route path="/watching/:collection" element={<CollectionPage status="watching" />} />
        <Route path="/want-to-watch" element={<WantToWatch />} />
        <Route path="/want-to-watch/:collection" element={<CollectionPage status="want_to_watch" />} />
        <Route path="/abandoned" element={<Abandoned />} />
        <Route path="/abandoned/:collection" element={<CollectionPage status="abandoned" />} />
        <Route path="/entry/:id" element={<EntryDetails />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/add"
          element={
            <RequireAdmin>
              <AddEntry />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <RequireAdmin>
              <EditEntry />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
