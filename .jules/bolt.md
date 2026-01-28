## 2025-02-18 - CountTable totalCount vs Map Size
**Learning:** `CountTable` class uses `totalCount` to represent the sum of all values (occurrences), not the number of unique keys (size of map). This distinction is critical when iterating over entries. Using `totalCount` as a loop limit for entries iteration caused out-of-bounds access and `undefined` entries.
**Action:** Always verify if a "count" property refers to the collection size or an aggregate value. Use `iterator.done` for safe iteration over collections instead of relying on external counters.
