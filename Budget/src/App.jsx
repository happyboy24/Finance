import { useState, useEffect } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetApp() {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [activeTab, setActiveTab] = useState("entry"); // "entry" | "summary"

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        setLoading(true);
        const res = await fetch('/api/entries');
        if (!res.ok) throw new Error('Failed to fetch entries');
        const data = await res.json();
        setEntries(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  async function addEntry() {
    if (desc === "" || isNaN(amount) || Number(amount) <= 0) {
      alert("Please fill in all fields!");
      return;
    }
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          desc, 
          amount: Number(amount), 
          type, 
          month: selectedMonth, 
          year: selectedYear 
        })
      });
      if (!res.ok) throw new Error('Failed to add entry');
      const newEntry = await res.json();
      setEntries([...entries, newEntry]);
      setDesc("");
      setAmount("");
    } catch (err) {
      alert('Error adding entry: ' + err.message);
    }
  }

  async function deleteEntry(id) {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete entry');
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      alert('Error deleting entry: ' + err.message);
    }
  }

  const monthEntries = entries.filter(
    (e) => e.month === selectedMonth && e.year === selectedYear
  );

  const monthIncome = monthEntries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const monthExpense = monthEntries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const monthSavings = monthIncome - monthExpense;

  const [rangeMonths, setRangeMonths] = useState(6);

  function getRangeSummary() {
    const result = [];
    for (let i = rangeMonths - 1; i >= 0; i--) {
      let m = today.getMonth() - i;
      let y = today.getFullYear();
      if (m < 0) { m += 12; y -= 1; }

      const monthData = entries.filter((e) => e.month === m && e.year === y);
      const income = monthData.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
      const expense = monthData.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
      result.push({ label: MONTHS[m].slice(0, 3) + " " + y, income, expense, savings: income - expense });
    }
    return result;
  }

  const rangeSummary = getRangeSummary();
  const totalIncome  = rangeSummary.reduce((s, r) => s + r.income, 0);
  const totalExpense = rangeSummary.reduce((s, r) => s + r.expense, 0);
  const totalSavings = totalIncome - totalExpense;

  const yearOptions = [today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1];

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>My Budget App</h2>

        <div style={s.tabs}>
          <button
            style={{ ...s.tab, ...(activeTab === "entry" ? s.activeTab : {}) }}
            onClick={() => setActiveTab("entry")}
          >
            Add Entry
          </button>
          <button
            style={{ ...s.tab, ...(activeTab === "summary" ? s.activeTab : {}) }}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>
        </div>

        {activeTab === "entry" && (
          <>
            <div style={s.row}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Month</label>
                <select style={s.input} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Year</label>
                <select style={s.input} value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <label style={s.label}>Description</label>
            <input style={s.input} type="text" placeholder="e.g. Salary, Rent..." value={desc} onChange={(e) => setDesc(e.target.value)} />

            <label style={s.label}>Amount (₦)</label>
            <input style={s.input} type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />

            <label style={s.label}>Type</label>
            <select style={s.input} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <button style={s.addBtn} onClick={addEntry}>Add</button>

            <div style={s.cards}>
              <div style={s.card}>
                <div style={s.cardLabel}>Income</div>
                <div style={{ ...s.cardValue, color: "#27ae60" }}>₦{monthIncome.toLocaleString()}</div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>Expenses</div>
                <div style={{ ...s.cardValue, color: "#e74c3c" }}>₦{monthExpense.toLocaleString()}</div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>Savings</div>
                <div style={{ ...s.cardValue, color: monthSavings >= 0 ? "#27ae60" : "#e74c3c" }}>
                  ₦{monthSavings.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={s.listHeader}>
              {MONTHS[selectedMonth]} {selectedYear} — Transactions
            </div>
            <div style={s.entryList}>
              {loading ? (
                <p style={s.emptyMsg}>Loading...</p>
              ) : error ? (
                <p style={s.emptyMsg}>Error: {error}</p>
              ) : monthEntries.length === 0 ? (
                <p style={s.emptyMsg}>No entries for this month</p>
              ) : (
                monthEntries.map((e) => (
                  <div key={e.id} style={s.entryRow}>
                    <span style={s.entryDesc}>{e.desc}</span>
                    <span style={{ ...s.entryAmount, color: e.type === "income" ? "#27ae60" : "#e74c3c" }}>
                      {e.type === "income" ? "+" : "-"}₦{e.amount.toLocaleString()}
                    </span>
                    <button style={s.deleteBtn} onClick={() => deleteEntry(e.id)}>×</button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "summary" && (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label style={s.label}>View last</label>
              <select style={{ ...s.input, marginBottom: 0 }} value={rangeMonths} onChange={(e) => setRangeMonths(Number(e.target.value))}>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>

            <div style={s.cards}>
              <div style={s.card}>
                <div style={s.cardLabel}>Total Income</div>
                <div style={{ ...s.cardValue, color: "#27ae60" }}>₦{totalIncome.toLocaleString()}</div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>Total Expenses</div>
                <div style={{ ...s.cardValue, color: "#e74c3c" }}>₦{totalExpense.toLocaleString()}</div>
              </div>
              <div style={s.card}>
                <div style={s.cardLabel}>Total Savings</div>
                <div style={{ ...s.cardValue, color: totalSavings >= 0 ? "#27ae60" : "#e74c3c" }}>
                  ₦{totalSavings.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={s.listHeader}>Month-by-Month Breakdown</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Month</th>
                  <th style={{ ...s.th, color: "#27ae60" }}>Income</th>
                  <th style={{ ...s.th, color: "#e74c3c" }}>Expense</th>
                  <th style={s.th}>Savings</th>
                </tr>
              </thead>
              <tbody>
                {rangeSummary.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : {}}>
                    <td style={s.td}>{row.label}</td>
                    <td style={{ ...s.td, color: "#27ae60" }}>₦{row.income.toLocaleString()}</td>
                    <td style={{ ...s.td, color: "#e74c3c" }}>₦{row.expense.toLocaleString()}</td>
                    <td style={{ ...s.td, color: row.savings >= 0 ? "#27ae60" : "#e74c3c", fontWeight: "bold" }}>
                      ₦{row.savings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f4", display: "flex", justifyContent: "center", padding: "30px 16px", minHeight: "100vh" },
  container: { backgroundColor: "#fff", borderRadius: "10px", padding: "24px", width: "100%", maxWidth: "520px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", height: "fit-content" },
  title: { fontSize: "22px", marginBottom: "16px", color: "#333" },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: { flex: 1, padding: "9px", fontSize: "14px", backgroundColor: "#f4f4f4", border: "1px solid #ddd", borderRadius: "6px", cursor: "pointer", color: "#555" },
  activeTab: { backgroundColor: "#4a90e2", color: "#fff", border: "1px solid #4a90e2", fontWeight: "bold" },
  row: { display: "flex", gap: "10px" },
  label: { display: "block", fontSize: "14px", color: "#555", marginBottom: "4px" },
  input: { width: "100%", padding: "10px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "6px", marginBottom: "14px", boxSizing: "border-box", outline: "none" },
  addBtn: { width: "100%", padding: "11px", fontSize: "15px", fontWeight: "bold", backgroundColor: "#4a90e2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", marginBottom: "20px" },
  cards: { display: "flex", gap: "10px", marginBottom: "20px" },
  card: { flex: 1, backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "12px 8px", textAlign: "center", border: "1px solid #eee" },
  cardLabel: { fontSize: "11px", color: "#888", marginBottom: "5px" },
  cardValue: { fontSize: "16px", fontWeight: "bold" },
  listHeader: { fontSize: "13px", fontWeight: "bold", color: "#888", marginBottom: "10px", templateTransform: "uppercase", letterSpacing: "0.05em" },
  entryList: { borderTop: "1px solid #eee", paddingTop: "10px" },
  entryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" },
  entryDesc: { fontSize: "14px", color: "#333", flex: 1 },
  entryAmount: { fontSize: "14px", fontWeight: "bold", margin: "0 10px" },
  deleteBtn: { background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer" },
  emptyMsg: { textAlign: "center", color: "#aaa", fontSize: "13px", padding: "16px 0" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { textAlign: "left", padding: "8px 6px", borderBottom: "2px solid #eee", color: "#555", fontSize: "12px" },
  td: { padding: "8px 6px", color: "#333" },
  trEven: { backgroundColor: "#fafafa" },
};
