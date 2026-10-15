/** The signed-in account isn't allowed to do this (e.g. missing from the database rules). */
export class PermissionDeniedError extends Error {
  constructor(cause?: unknown) {
    super("Permission denied", { cause });
    this.name = "PermissionDeniedError";
  }
}
