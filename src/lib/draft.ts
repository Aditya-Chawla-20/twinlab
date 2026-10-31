import { parseProject, type Project } from "./project";

export const DRAFT_KEY = "twinlab.project.v1";
const MAX_CHARACTERS = 1_500_000;
type DraftStorage = Pick<Storage, "getItem" | "setItem">;

export function loadDraft(storage?: Pick<DraftStorage, "getItem">): {
  project: Project | null;
  error: string;
  protected: boolean;
} {
  let raw: string | null = null;
  try {
    raw = (storage ?? window.localStorage).getItem(DRAFT_KEY);
    if (raw === null) return { project: null, error: "", protected: false };
    if (raw.length > MAX_CHARACTERS) throw new Error("Oversized draft.");
    const draft = JSON.parse(raw);
    if (draft?.version !== 1) throw new Error("Unsupported draft.");
    return {
      project: parseProject(draft.project),
      error: "",
      protected: false,
    };
  } catch {
    return {
      project: null,
      protected: raw !== null,
      error:
        raw !== null
          ? "The existing browser draft could not be read and has been preserved. Export current work before replacing it."
          : "Browser draft storage is unavailable. Save project JSON before closing.",
    };
  }
}
export function saveDraft(
  project: Project,
  storage?: Pick<DraftStorage, "setItem">,
) {
  const raw = JSON.stringify({ version: 1, project: parseProject(project) });
  if (raw.length > MAX_CHARACTERS)
    throw new Error(
      "This project is too large for browser recovery. Save project JSON before closing.",
    );
  try {
    (storage ?? window.localStorage).setItem(DRAFT_KEY, raw);
  } catch {
    throw new Error(
      "Browser recovery could not save, possibly because storage is full or disabled. Save project JSON before closing.",
    );
  }
}
