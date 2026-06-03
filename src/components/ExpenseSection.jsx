import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { expenseCategories } from "../data/mockData.js";
import { formatCurrency, formatDate } from "../utils/expenseUtils.js";

export function ExpenseSection({ form, expenses, onFormChange, onSubmit, onDelete, onReset }) {
  return (
    <section className="workspace" id="expenses">
      <div className="section-heading">
        <p className="eyebrow">Expense management</p>
        <h2>Capture spending without slowing down.</h2>
      </div>
      <div className="expense-layout">
        <ExpenseForm form={form} onFormChange={onFormChange} onSubmit={onSubmit} />
        <ExpenseTable expenses={expenses} onDelete={onDelete} onReset={onReset} />
      </div>
    </section>
  );
}

function ExpenseForm({ form, onFormChange, onSubmit }) {
  return (
    <form className="expense-form" onSubmit={onSubmit}>
      <label>
        Amount
        <input
          type="number"
          name="amount"
          min="1"
          placeholder="2500"
          value={form.amount}
          onChange={onFormChange}
          required
        />
      </label>
      <label>
        Category
        <select name="category" value={form.category} onChange={onFormChange}>
          {expenseCategories.map((category) => (
            <option key={category.name}>{category.name}</option>
          ))}
        </select>
      </label>
      <label>
        Date
        <input type="date" name="date" value={form.date} onChange={onFormChange} required />
      </label>
      <label>
        Description
        <input
          type="text"
          name="description"
          placeholder="Airport transfer"
          value={form.description}
          onChange={onFormChange}
          required
        />
      </label>
      <button className="primary-action" type="submit">
        <Plus size={18} />
        Save expense
      </button>
    </form>
  );
}

function ExpenseTable({ expenses, onDelete, onReset }) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function handleDelete(id) {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 320);
  }

  function handleReset() {
    if (!confirmResetOpen) {
      setConfirmResetOpen(true);
      return;
    }
    onReset();
    setConfirmResetOpen(false);
  }

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <strong>Recent expenses</strong>
        <div className="table-toolbar-actions">
          {confirmResetOpen && (
            <button
              className="reset-cancel-btn"
              onClick={() => setConfirmResetOpen(false)}
              aria-label="Cancel reset"
            >
              Cancel
            </button>
          )}
          <button
            className={`reset-btn ${confirmResetOpen ? "reset-btn--confirm" : ""}`}
            onClick={handleReset}
            aria-label={confirmResetOpen ? "Confirm reset all expenses" : "Reset all expenses"}
            title={confirmResetOpen ? "Click again to confirm" : "Reset to defaults"}
          >
            <RotateCcw size={16} />
            {confirmResetOpen ? "Confirm reset?" : "Reset all"}
          </button>
          <button className="icon-button" aria-label="Filter expenses">
            <Search size={18} />
          </button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className={deletingId === expense.id ? "row-deleting" : ""}
            >
              <td>{expense.name}</td>
              <td>{expense.category}</td>
              <td>{formatDate(expense.date)}</td>
              <td>{formatCurrency(expense.amount)}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(expense.id)}
                  aria-label={`Delete ${expense.name}`}
                  title="Delete expense"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {expenses.length === 0 && (
        <div className="empty-state">
          <p>No expenses yet. Add one above to get started!</p>
        </div>
      )}
    </div>
  );
}
