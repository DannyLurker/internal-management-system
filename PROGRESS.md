# Progress Log

## Location Feature

### Location Feature Development

- Created repository layer at `features/locations/location.repository.ts`
  - CRUD operations: `create`, `findById`, `getMany`, `get`, `update`, `delete`
  - Built-in type-safe selection utility `locationSelectData`
  - Clause builder `buildLocationWhereClause` filtering by case-insensitive name (3+ chars) and `locationType`
- Created service layer at `features/locations/location.service.ts`
  - Create: Associates creator session ID and handles auditing under the `LOCATION` entity
  - GetById: Retrieves location with paginated stocks, custom sorting (by stock type or name), and stock count
  - GetMany: Checks `canManageLocation` permission, returns paginated location records with creator/updater details
  - Update: Updates details and logs audit trail with old and new values
  - Delete: Checks `canDeleteLocation` rule (cannot delete location with active stocks), deletes, and logs audit trail
- Created rule layer at `features/locations/location.rule.ts`
  - Restricts location deletion if there are any associated stocks, returning a descriptive error message
- Created client-side API layer at `features/locations/location.api.ts`
  - Handles network requests for `getMany`, `getById`, `create`, `update`, and `delete` REST endpoints
- Created React hooks at `features/locations/location.hooks.ts`
  - Integrated TanStack Query hooks (`useLocation`, `useLocations`, `useCreateLocation`, `useUpdateLocation`, and `useDeleteLocation`) with caching and invalidation support
- Created frontend management component at `features/locations/components/LocationManagement.tsx`
  - Supports listing, filtering, searching, creating, updating, and deleting locations

### Location Feature Testing

- Created unit tests in `unit-tests/locations/` covering:
  - Deletion rules in `location.rule.test.ts`
  - Service functions in `location.service.*.test.ts` (create, delete, getById, getMany, update)
- Created integration tests at `integration-tests/location.service.integration.test.ts`
  - Exercises database-level semantics including case-insensitive search, sorting, and pagination
- Created E2E tests at `e2e-tests/location.spec.ts`
  - End-to-end user flows for creating, updating, and deleting locations, including verification of deletion blocks for locations with active items

## Stock Feature

### Stock Feature Testing

- Created unit test file at `tests/stock.spec.ts` for stock CRUD operations
- Test coverage includes: Create, Get list, Get by ID, Get by item, Update, and various error cases
- Follows the same pattern as `tests/item.spec.ts` for consistency
- Uses Playwright with serial execution mode

## Stock Movements Feature

### Stock Movements Feature Development

- Created repository layer at `features/stock-movements/stock-movements.repository.ts`
  - CRUD operations: create, getById, getMany, count, update, delete
  - Helper function for type-safe select queries
- Created service layer at `features/stock-movements/stock-movements.service.ts`
  - Create: Validates data, checks related entities (item, stock, locations, order), type-specific validations
  - Get operations: getById and getMany with search and filtering
  - Update: Updates movement reason with audit logging
  - Delete: Deletes movement with audit logging
  - All operations include session validation, role-based access control, and audit logging

### Stock Movements Testing

- Fixed `tests/stock-movement.spec.ts` to match actual implementation
- Removed non-existent functionality (quick actions, complex stock manipulation)
- Aligned with actual API endpoints and schema field names
- Test coverage: Create (RECEIVE), Get list, Get by ID, Update, and error cases
- Note: Delete functionality not implemented per feature-notes.md



## Notes

- Stock movement feature does not have delete functionality (per feature-notes.md)
- Update endpoints pass resource ID in request body (inconsistent with REST pattern, At category, item, and stock feature)
- Create/update/delete endpoints return null as data, requiring additional requests to get IDs (At category, item, and stock feature)
- Integration testing is still not really important for now
