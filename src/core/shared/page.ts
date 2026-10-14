/** A slice of a larger, cursor-paginated result set. */
export interface Page<T> {
  items: T[];
  /** Opaque cursor for the next page, or `null` when there is nothing more. */
  nextCursor: string | null;
}
