-- Trigram indexes for the in-store employee's customer search.
--
-- Requirement 7 of the brief: "allow in-store employees to view a customer's prizes in
-- order to hand them over". In practice the employee has the customer in front of them and
-- types a fragment of a name or an email — a substring search, not a prefix search.
--
-- `LIKE '%fragment%'` cannot use a B-tree index: a B-tree is ordered by prefix, and a
-- pattern that starts with a wildcard has no prefix to seek on. PostgreSQL falls back to a
-- sequential scan over the whole User table, which at 40,000 customers means the employee
-- waits while a queue forms behind the customer.
--
-- `pg_trgm` + GIN indexes the three-character sequences of the value, which is what makes
-- an unanchored substring search indexable.
--
-- This is the decision recorded in 01-pilotage/DECISIONS.md § 3: Elasticsearch was removed
-- from the stack because it has been under the Elastic v2 / SSPL licence since 7.11 and is
-- therefore NOT open source, which the brief requires. `pg_trgm` is part of PostgreSQL's
-- contrib modules, under the same PostgreSQL licence, and is enough for a search over one
-- table of a few tens of thousands of rows.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexed on `lower(...)` and queried on `lower(...)`, so the search is case-insensitive
-- without the index being bypassed. `ILIKE` against a plain-column index would not match
-- this expression, which is why the search in EmployeeService is written as raw SQL with
-- an explicit `lower()` on both sides.
CREATE INDEX "User_email_trgm_idx"
  ON "User" USING gin (lower("email") gin_trgm_ops);

-- One index over the concatenation rather than two separate ones: the employee types
-- "camille rousseau" as a single string, and two per-column indexes would not serve a
-- fragment that straddles the space.
CREATE INDEX "User_full_name_trgm_idx"
  ON "User" USING gin (lower("firstName" || ' ' || "lastName") gin_trgm_ops);
