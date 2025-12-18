# saas-notes-system
SaaS Notes System

**3. Use Read Replicas:**
- Run cleanup on replica
- Minimal impact on production reads

---

## Troubleshooting

### Issue: Cleanup Taking Too Long

**Solution:** Adjust batch size and delay
```typescript
const batchSize = 5000 // Increase from 1000
await new Promise(resolve => setTimeout(resolve, 50)) // Reduce delay
```

### Issue: Too Many History Entries

**Solution:** Check for update loops
```typescript
// Add logging to model hook
@beforeUpdate()
static async createHistoryEntry(note: Note) {
  console.log('Creating history for note:', note.id, 'Dirty fields:', note.$dirty)
  // ... rest of code
}
```

### Issue: Table Lock Warnings

**Solution:** Run during maintenance window
```bash
# Stop app temporarily
pm2 stop notes-api

# Run aggressive cleanup
node ace cleanup:old_histories --batch-size=10000

# Restart app
pm2 start notes-api
```

---

## API Endpoints

### GET /api/notes/:id/history

Returns all history entries for a note (last 7 days only).

**Authorization:** Only note owner can view history.

### POST /api/notes/:id/history/:historyId/restore

Restores note to a previous version.

**Process:**
1. Current note state is saved to history
2. Selected history version becomes current
3. Returns updated note

**Authorization:** Only note owner can restore.

---

## Best Practices

1. ✅ **Run cleanup during off-peak hours** (2-4 AM)
2. ✅ **Monitor cleanup duration** and adjust if needed
3. ✅ **Set up failure alerts** (email, Slack, PagerDuty)
4. ✅ **Test restore functionality** regularly
5. ✅ **Archive important history** before 7-day deletion if needed
6. ✅ **Use system cron** for production reliability
7. ✅ **Optimize table weekly** to reclaim disk space
8. ✅ **Monitor database size** and set alerts

---

## Summary

The History System provides:
- ✅ **Automatic tracking** of all note changes
- ✅ **7-day retention** with automatic cleanup
- ✅ **Non-blocking cleanup** via batch deletion
- ✅ **Zero performance impact** on user operations
- ✅ **Multiple deployment options** (cron, scheduler, MySQL events)
- ✅ **Scalable** to millions of history entries
- ✅ **Production-ready** with monitoring and alerts

**Recommended Setup:** System cron at 2 AM daily with log monitoring.

---

## ✅ What Changed

### **Model:**
- ✅ Added `currentUserId` property (non-persisted)
- ✅ Hook uses `currentUserId` if set, falls back to `userId`
- ✅ History tracks **who made the change**, not note owner

### **Controllers:**
- ✅ `update()` - Sets `currentUserId` before saving
- ✅ `autosave()` - Sets `currentUserId` before saving
- ✅ `publish()` - Sets `currentUserId` before saving
- ✅ `unpublish()` - Sets `currentUserId` before saving
- ✅ `restore()` - Sets `currentUserId` before restoring

### **Permission Logic:**
- ✅ **Private notes**: Only owner can edit
- ✅ **Public notes**: Anyone in company can edit
- ✅ History tracks who made each change

---

## 🎯 Example Scenarios

### **Scenario 1: Owner edits their own note**
```
Note Owner: Alice (ID: 1)
Current Editor: Alice (ID: 1)
History Entry: userId = 1 (Alice)
```

### **Scenario 2: Another user edits a public note**
```
Note Owner: Alice (ID: 1)
Current Editor: Bob (ID: 2)
History Entry: userId = 2 (Bob) ✅ Correct!
```

### **Scenario 3: Multiple users collaborate**
```
Note Owner: Alice (ID: 1)

Edit 1: Bob edits → History userId = 2
Edit 2: Carol edits → History userId = 3
Edit 3: Alice edits → History userId = 1

Timeline shows: Carol → Bob → Alice (chronological)
