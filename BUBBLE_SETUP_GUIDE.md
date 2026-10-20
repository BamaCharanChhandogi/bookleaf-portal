# 📘 Bubble.io Visual Setup & Configuration Blueprint
### BookLeaf Publishing — Assignment 2: Author Royalty Dashboard & Automated Notification System

This guide provides the exact click-by-click instructions, field types, formula expressions, and workflow configurations to build the BookLeaf system on Bubble.io within 45–60 minutes.

---

## 🗄️ Step 1: Database Setup & 1-Click CSV Import

Go to **Data** → **Data types** in your Bubble editor.

### 1.1 Create Data Type: `Author`
Add the following custom fields:
| Field Name | Field Type | Description |
| :--- | :--- | :--- |
| `Author_ID` | text | Unique ID (e.g., `AUTH001`) |
| `Name` | text | Author full name |
| `Email` | text | Author email address |
| `Phone` | text | Contact number |
| `City` | text | Author city (e.g., Mumbai, Delhi) |
| `Role` | text | `AUTHOR` or `ADMIN` |
| `Total_Books` | number | Number of titles published/in progress |
| `Total_Royalty_Earned` | number | Accumulated lifetime royalties |
| `Royalty_Paid` | number | Total disbursed royalties |
| `Royalty_Pending` | number | Unpaid pending balance |
| `Payout_Status` | text | `FULLY_PAID`, `PENDING`, or `OVERDUE` |
| `Last_Payout_Date` | date | Date of most recent payout |

👉 **Import Data**: Go to **App data** → **Authors** → Click **Upload** → Select `bubble_seeds/authors.csv`. Map the column names directly to the field names.

---

### 1.2 Create Data Type: `Book`
Add the following custom fields:
| Field Name | Field Type | Description |
| :--- | :--- | :--- |
| `Book_ID` | text | Unique ID (e.g., `BK001`) |
| `Author_ID` | text | Associated author ID |
| `Author_Name` | text | Author name |
| `Title` | text | Book title |
| `ISBN` | text | ISBN number |
| `Genre` | text | Literary Fiction, Romance, etc. |
| `Status` | text | `Published & Live`, `In Production - Cover Design`, etc. |
| `Publication_Date` | date | Publication release date |
| `MRP` | number | Maximum Retail Price |
| `Royalty_Per_Copy` | number | Author royalty per copy (₹) |
| `Total_Copies_Sold` | number | Units sold |
| `Total_Royalty_Earned`| number | Total earned (₹) |
| `Royalty_Paid` | number | Disbursed (₹) |
| `Royalty_Pending` | number | Outstanding balance (₹) |
| `Last_Payout_Date` | date | Date of last payout |
| `Print_Partner` | text | `In-House`, `Repro India`, etc. |
| `Platform_Availability`| text | Retail listings (Amazon, Flipkart) |

👉 **Import Data**: Go to **App data** → **Books** → Click **Upload** → Select `bubble_seeds/books.csv`.

---

### 1.3 Create Data Type: `NotificationLog`
Add the following custom fields:
| Field Name | Field Type | Description |
| :--- | :--- | :--- |
| `Author_ID` | text | Target author ID |
| `Author_Name` | text | Target author name |
| `Author_Email` | text | Target author email |
| `Trigger_Type` | text | `SINGLE` or `BULK` |
| `Status` | text | `SUCCESS` or `FAILED` |
| `Timestamp` | date | Dispatch date/time |
| `Summary_Snippet` | text | Preview of AI summary email |
| `Error_Message` | text | Error reason if failed |

👉 **Import Data**: Go to **App data** → **NotificationLogs** → Click **Upload** → Select `bubble_seeds/notification_logs.csv`.

---

## 🔒 Step 2: Privacy Rules Configuration (Page 3 Requirement A4)

Go to **Data** → **Privacy**:

### On `Author` Data Type:
- **Rule 1: "Admin Full Access"**:
  - `Current User's Role is "ADMIN"`
  - ✅ View all fields, ✅ Find this in searches, ✅ Allow auto-binding
- **Rule 2: "Author Self Access"**:
  - `Current User's Email is This Author's Email`
  - ✅ View all fields, ✅ Find this in searches
- **Rule 3: Everyone Else (Default)**:
  - ❌ Uncheck all boxes (Authors cannot see other authors).

### On `Book` Data Type:
- **Rule 1: "Admin Full Access"**:
  - `Current User's Role is "ADMIN"`
  - ✅ View all fields, ✅ Find this in searches
- **Rule 2: "Author Book Access"**:
  - `This Book's Author_ID is Current User's Author_ID`
  - ✅ View all fields, ✅ Find this in searches
- **Rule 3: Everyone Else (Default)**:
  - ❌ Uncheck all boxes.

---

## 🔌 Step 3: API Connector Setup (Bubble ↔ n8n Webhook)

Go to **Plugins** → Click **Add Plugins** → Install **API Connector**.

Click **Add another API**:
- **API Name**: `BookLeaf n8n Engine`
- **Authentication**: `None or self-handled`

Click **Add another call**:
- **Call Name**: `TriggerRoyaltySummary`
- **Use as**: `Action`
- **Data type**: `JSON`
- **Method**: `POST`
- **URL**: `https://<YOUR-N8N-DOMAIN-OR-NGROK>/webhook/bookleaf-royalty-summary`
- **Headers**:
  - Key: `Content-Type` | Value: `application/json`
  - Key: `x-bookleaf-secret` | Value: `bk_live_sec_9941a`
- **Body (JSON)**:
```json
{
  "authorId": "AUTH001",
  "name": "Priya Sharma",
  "email": "priya.sharma@email.com",
  "city": "Mumbai",
  "totalRoyaltyEarned": 11970,
  "royaltyPaid": 8400,
  "royaltyPending": 3570,
  "lastPayoutDate": "2025-10-15",
  "triggerType": "SINGLE",
  "books": [
    {
      "title": "Whispers of the Ganges",
      "isbn": "978-93-5XXXX-01-1",
      "status": "Published & Live",
      "totalCopiesSold": 342,
      "royaltyPending": 3570
    }
  ]
}
```
Click **Initialize call**. Bubble will inspect the response and confirm the data types (`success`, `status`, `emailPreview`).

---

## 🎨 Step 4: Author Portal (`/author-dashboard`)

Create a page named `author-dashboard` (Page Type: `Author`):

### 4.1 Consolidated Metrics Cards
Add 4 text blocks at the top showing:
1. **Total Copies Sold**: `Search for Books:filtered (Author_ID = Current User's Author_ID)'s Total_Copies_Sold:sum`
2. **Total Royalty Earned**: `₹ Current User's Author's Total_Royalty_Earned:formatted as 1,000`
3. **Royalty Disbursed**: `₹ Current User's Author's Royalty_Paid:formatted as 1,000`
4. **Pending Balance**: `₹ Current User's Author's Royalty_Pending:formatted as 1,000`

### 4.2 My Books Repeating Group
- **Type of content**: `Book`
- **Data source**: `Search for Books (Author_ID = Current User's Author_ID)`
- Columns: Title, ISBN, Genre, Status, MRP, Total Sold, Earned, Paid, Pending.

### 4.3 Traffic Light Royalty Status Badge
Add a text element inside the cell for **Royalty Status**:
- **Default text**: `🟡 PENDING (IN CYCLE)` | Background: Amber-100, Text: Amber-800
- **Conditional 1 (🟢 Green - Fully Paid)**:
  - Condition: `Current cell's Book's Royalty_Pending is 0`
  - Text: `🟢 FULLY PAID` | Background: Emerald-100, Text: Emerald-800
- **Conditional 2 (🔴 Red - Overdue)**:
  - Condition: `Current cell's Book's Royalty_Pending > 0 AND (Current date/time - Current cell's Book's Last_Payout_Date:extract days > 90 OR Current cell's Book's Last_Payout_Date is empty)`
  - Text: `🔴 OVERDUE` | Background: Rose-100, Text: Rose-800

---

## 🛠️ Step 5: Admin Operations Portal (`/admin-dashboard`)

Create a page named `admin-dashboard`:

### 5.1 Filters & Author Overview
- **Search Input**: Input element for `Search by Author Name`.
- **City Dropdown**: Choices: `All`, `Mumbai`, `Delhi`, `Hyderabad`, `Pune`, `Kochi`, `Chandigarh`, `Bangalore`, `Lucknow`, `Nagpur`, `Kolkata`.
- **Status Dropdown**: Choices: `All`, `FULLY_PAID`, `PENDING`, `OVERDUE`.
- **Repeating Group**:
  - Type: `Author`
  - Data Source: `Search for Authors` with constraints:
    - `Name contains Search Input's value` (ignore empty)
    - `City = City Dropdown's value` (ignore empty)
    - `Payout_Status = Status Dropdown's value` (ignore empty)

### 5.2 Single Trigger Action ("Generate & Send Royalty Summary")
On the Author row or detail popup:
- Add button: **"Generate & Send Royalty Summary"**
- **Workflow**:
  1. Action 1: `Plugins` → `BookLeaf n8n Engine - TriggerRoyaltySummary`:
     - Pass `Current cell's Author's Author_ID`, `Name`, `Email`, `Royalty_Pending`, etc.
  2. Action 2: `Data` → `Create a new thing` (`NotificationLog`):
     - `Author_ID`: `Current cell's Author's Author_ID`
     - `Author_Name`: `Current cell's Author's Name`
     - `Author_Email`: `Current cell's Author's Email`
     - `Status`: `Result of step 1's status`
     - `Summary_Snippet`: `Result of step 1's emailPreview`
     - `Timestamp`: `Current date/time`
     - `Trigger_Type`: `SINGLE`
  3. Action 3: Display alert: `Royalty summary dispatched and logged!`

### 5.3 Bulk Trigger Action ("Bulk Trigger Pending Summaries")
On the top right of the Admin Dashboard:
- Add button: **"⚡ Bulk Trigger All Pending (N)"**
  - Text dynamic: `"⚡ Bulk Trigger All Pending (" & Search for Authors:filtered (Royalty_Pending > 0):count & ")"`
- **Workflow**:
  1. Trigger custom workflow or iterate over `Search for Authors (Royalty_Pending > 0)`.
  2. For each author, trigger the API connector call.
  3. Create corresponding `NotificationLog` entry with `Trigger_Type = BULK`.

### 5.4 Notification Log Table
At the bottom of the Admin Dashboard:
- Repeating Group of `NotificationLog` sorted by `Timestamp` descending.
- Shows: Author Name, Trigger Type badge (`SINGLE`/`BULK`), Status pill (🟢 `SUCCESS` / 🔴 `FAILED`), Timestamp, and Summary Preview snippet.

---

## ⚡ Step 6: Testing & Edge Case Verification

Test by logging in as:
1. **`priya.sharma@email.com`**: Verify only Priya's 2 books are visible with yellow/pending status.
2. **`farhan.sheikh@email.com`**: Verify green `FULLY PAID` badge (0 pending).
3. **`kavita.deshmukh@email.com`**: Verify ₹850 rollover threshold edge case (`BK016`) and in-typesetting book (`BK015`).
4. **`admin@bookleaf.com`**: Click "Generate & Send Royalty Summary" on Priya Sharma. Verify the n8n execution log executes successfully and creates the `NotificationLog` record!
