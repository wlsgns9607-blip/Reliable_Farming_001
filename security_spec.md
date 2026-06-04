# Security Specification - Farming App

## 1. Data Invariants
- **User Profile**: Every user must have a record in `/users/{userId}`. Role must be 'farmer' or 'family'.
- **Farm Log**: Must have a `userId` that matches the creator. Access is shared with family members.
- **Schedule**: Must have a `userId` that matches the creator. Only the owner can read/write their own schedules.
- **Harvest Guide**: Publicly readable for authenticated users, but no one can write via client SDK.

## 2. The "Dirty Dozen" Payloads (Schedules)

1. **Identity Spoofing (Create)**:
   ```json
   {
     "userId": "TARGET_USER_ID",
     "title": "Malicious Holiday",
     "startDate": "2024-01-01",
     "endDate": "2024-01-07",
     "type": "travel"
   }
   ```
   *Expected: PERMISSION_DENIED (userId doesn't match auth.uid)*

2. **State Shortcutting (Update)**:
   ```json
   {
     "userId": "MY_ID",
     "title": "Changing ID",
     "startDate": "2024-01-01",
     "endDate": "2024-01-07",
     "type": "travel"
   }
   ```
   *Attack: Try to change the `userId` of an existing document.*
   *Expected: PERMISSION_DENIED (userId is immutable)*

3. **Resource Poisoning (ID)**:
   *Attack: Use a document ID that is 1MB of junk characters.*
   *Expected: PERMISSION_DENIED (isValidId check fails)*

4. **Resource Poisoning (Field)**:
   ```json
   {
     "title": "A".repeat(1000000),
     "startDate": "2024-01-01",
     "endDate": "2024-01-07",
     "type": "travel"
   }
   ```
   *Expected: PERMISSION_DENIED (title size > MAX)*

5. **Invalid Enum**:
   ```json
   {
     "type": "party_time"
   }
   ```
   *Expected: PERMISSION_DENIED (type not in ['travel', 'rest'])*

6. **Invalid Date Format**:
   ```json
   {
     "startDate": "Next Tuesday"
   }
   ```
   *Expected: PERMISSION_DENIED (regex check for YYYY-MM-DD)*

7. **Unauthorized List**:
   *Action: `list schedules` without a filter on `userId`.*
   *Expected: PERMISSION_DENIED (Rule must enforce resource.data.userId == request.auth.uid)*

8. **Unauthorized Get**:
   *Action: `get /schedules/SOMEONE_ELSES_DOC`.*
   *Expected: PERMISSION_DENIED (isOwner(existing().userId) check)*

9. **Timestamp Spoofing**:
   ```json
   {
     "timestamp": "2000-01-01T00:00:00Z"
   }
   ```
   *Expected: PERMISSION_DENIED (Must match request.time)*

10. **Shadow Field Injection**:
    ```json
    {
      "userId": "MY_ID",
      "isAdmin": true
    }
    ```
    *Expected: PERMISSION_DENIED (keys().size() check)*

11. **PII Blanket Leak**:
    *Action: Try to list all users' emails.*
    *Expected: PERMISSION_DENIED*

12. **Recursive Cost Attack**:
    *Action: Querying schedules with complex conditions designed to force many lookups.*
    *Expected: Denied by default if not strictly owner-based.*

## 3. Test Runner Logic
The `firestore.rules.test.ts` will verify these cases.
