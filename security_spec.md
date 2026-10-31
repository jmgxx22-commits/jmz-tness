# Security Specification: J-MZ Tness Firestore Security Rules

## 1. Data Invariants

1. **User Isolation**: All user-specific sub-collections (`/users/{userId}/*`) must belong strictly to the authenticated user (`request.auth.uid == userId`). Cross-user reading, querying, creating, updating, or deleting is strictly prohibited.
2. **Path Variable Hardening**: All `{userId}`, `{workoutId}`, `{weightId}`, `{mealId}`, `{sessionId}`, `{photoId}`, and `{routineId}` path variables must validate via `isValidId()`.
3. **Identity Integrity**: Any document containing a `userId` field must have `incoming().userId == request.auth.uid` on create, and on update `incoming().userId == existing().userId`.
4. **Immutability of IDs and Timestamps**: Creation timestamps and primary identifiers must not be mutable across updates.
5. **Payload Size Constraints**: Every string and list property must be strictly size-bounded to prevent Denial of Wallet attacks.
6. **No Blanket Reads**: No query or read can be allowed without enforcing user ownership on `resource.data.userId` or path binding `request.auth.uid == userId`.

---

## 2. The "Dirty Dozen" Threat Vectors (Attack Payloads)

| # | Threat Scenario | Attack Description | Expected Result |
|---|-----------------|--------------------|-----------------|
| 1 | Unauthenticated Read | Unauthenticated request attempts to read `/users/{userId}` | `PERMISSION_DENIED` |
| 2 | Cross-User Read | User B attempts to read User A's profile at `/users/{userA}` | `PERMISSION_DENIED` |
| 3 | Cross-User Write | User B attempts to write a workout to `/users/{userA}/workouts/{w1}` | `PERMISSION_DENIED` |
| 4 | Identity Spoofing | User A creates a workout in their path with `userId: "userB"` | `PERMISSION_DENIED` |
| 5 | Path Variable Injection | Attacker tries path `/users/user-1/workouts/invalid$$$path##name` | `PERMISSION_DENIED` |
| 6 | Huge Payload (Denial of Wallet) | Attacker sends a 2MB string in the `notes` field | `PERMISSION_DENIED` |
| 7 | Shadow Field Injection | Attacker injects extra field `isAdmin: true` into `UserProfile` | `PERMISSION_DENIED` |
| 8 | Unverified Email Access | User with `email_verified == false` attempts write | `PERMISSION_DENIED` |
| 9 | Immutable Field Mutation | User tries to change `userId` or `createdAt` on an existing workout | `PERMISSION_DENIED` |
| 10| Collection-wide query leak | Query on `/users` collection without filtering by `userId` | `PERMISSION_DENIED` |
| 11| Malformed Numeric Fields | Sending a string value for `calories` or `weight` | `PERMISSION_DENIED` |
| 12| Non-existent parent path bypass | Attempting to access random paths outside `/users/{userId}` | `PERMISSION_DENIED` |
