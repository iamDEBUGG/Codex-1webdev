import { Plus, Search } from "lucide-react";
import { expenseCategories } from "../data/mockData.js";
import { formatCurrency, formatDate } from "../utils/expenseUtils.js";

export function ExpenseSection({ form, expenses, onFormChange, onSubmit }) {
  return (
    <section className="workspace" id="expenses">
      <div className="section-heading">
        <p className="eyebrow">Expense management</p>
        <h2>Capture spending without slowing down.</h2>
      </div>
      <div className="expense-layout">
        <ExpenseForm form={form} onFormChange={onFormChange} onSubmit={onSubmit} />
        <ExpenseTable expenses={expenses} />
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

function ExpenseTable({ expenses }) {
  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <strong>Recent expenses</strong>
        <button className="icon-button" aria-label="Filter expenses">
          <Search size={18} />
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.name}</td>
              <td>{expense.category}</td>
              <td>{formatDate(expense.date)}</td>
              <td>{formatCurrency(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
