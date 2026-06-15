import {
  BarChart3,
  ChevronDown,
  Lightbulb,
  PiggyBank,
  Plane,
  Sparkles,
  TrendingDown,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  analyzeBudget,
  findSavings,
  generateBudgetPlan,
  getSpendingInsights,
  suggestAlternatives,
} from "../utils/aiEngine.js";
import { formatCurrency } from "../utils/expenseUtils.js";

const quickActions = [
  { id: "insights", label: "Analyze my spending", icon: BarChart3 },
  { id: "savings", label: "Find savings", icon: PiggyBank },
  { id: "plan", label: "Plan a trip budget", icon: Plane },
  { id: "subscriptions", label: "Subscription check", icon: TrendingDown },
];

const styleOptions = [
  { id: "comfort", label: "Comfort", emoji: "✨" },
  { id: "balanced", label: "Balanced", emoji: "⚖️" },
  { id: "budget", label: "Budget", emoji: "💰" },
];

const greetingMessage = {
  role: "ai",
  type: "greeting",
  content:
    "I'm your Smart Expense AI. I analyze your spending data to find savings, optimize your budget, and help plan trips. Pick an action below to get started.",
};

export function SmartExpenseAI({ expenses }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([greetingMessage]);
  const [planForm, setPlanForm] = useState({ destination: "", budget: "", style: "balanced" });
  const [showPlanForm, setShowPlanForm] = useState(false);

  function addMessage(msg) {
    setMessages((prev) => [...prev, msg]);
  }

  function handleAction(actionId) {
    switch (actionId) {
      case "insights": {
        addMessage({ role: "user", content: "Analyze my spending" });
        const result = getSpendingInsights(expenses);
        addMessage({ role: "ai", type: "insights", data: result });
        break;
      }
      case "savings": {
        addMessage({ role: "user", content: "Find savings" });
        const result = findSavings(expenses);
        addMessage({ role: "ai", type: "savings", data: result });
        break;
      }
      case "plan": {
        addMessage({ role: "user", content: "Plan a trip budget" });
        setShowPlanForm(true);
        break;
      }
      case "subscriptions": {
        addMessage({ role: "user", content: "Subscription check" });
        const result = analyzeBudget(expenses);
        addMessage({ role: "ai", type: "budget-analysis", data: result });
        break;
      }
      default:
        break;
    }
  }

  function handlePlanSubmit(e) {
    e.preventDefault();
    const result = generateBudgetPlan(planForm.destination, planForm.budget, planForm.style);
    addMessage({
      role: "user",
      content: `Plan trip: ${planForm.destination || "Trip"} — ${formatCurrency(Number(planForm.budget))} (${planForm.style})`,
    });
    addMessage({ role: "ai", type: "budget-plan", data: result });
    setShowPlanForm(false);
    setPlanForm({ destination: "", budget: "", style: "balanced" });
  }

  function handleCategoryAlternatives(category) {
    addMessage({ role: "user", content: `Alternatives for ${category}` });
    const result = suggestAlternatives(category);
    addMessage({ role: "ai", type: "alternatives", data: result });
  }

  function clearChat() {
    setMessages([greetingMessage]);
    setShowPlanForm(false);
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`ai-fab ${isOpen ? "ai-fab--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Smart AI" : "Open Smart AI"}
        id="smart-ai"
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Chat Drawer */}
      <div className={`ai-drawer ${isOpen ? "ai-drawer--open" : ""}`} aria-hidden={!isOpen}>
        <div className="ai-drawer-header">
          <div className="ai-drawer-title">
            <Sparkles size={18} />
            <strong>Smart Expense AI</strong>
          </div>
          <div className="ai-drawer-actions">
            <button className="ai-clear-btn" onClick={clearChat} title="Clear conversation">
              Clear
            </button>
            <button
              className="ai-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        <div className="ai-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`ai-message ai-message--${msg.role}`}>
              {msg.role === "user" && <UserMessage content={msg.content} />}
              {msg.role === "ai" && msg.type === "greeting" && (
                <p className="ai-greeting">{msg.content}</p>
              )}
              {msg.role === "ai" && msg.type === "insights" && (
                <InsightsCard data={msg.data} />
              )}
              {msg.role === "ai" && msg.type === "savings" && (
                <SavingsCard data={msg.data} onViewAlternatives={handleCategoryAlternatives} />
              )}
              {msg.role === "ai" && msg.type === "budget-analysis" && (
                <BudgetAnalysisCard data={msg.data} />
              )}
              {msg.role === "ai" && msg.type === "budget-plan" && (
                <BudgetPlanCard data={msg.data} />
              )}
              {msg.role === "ai" && msg.type === "alternatives" && (
                <AlternativesCard data={msg.data} />
              )}
            </div>
          ))}

          {/* Plan form inline */}
          {showPlanForm && (
            <div className="ai-message ai-message--ai">
              <PlanFormInline
                form={planForm}
                onChange={setPlanForm}
                onSubmit={handlePlanSubmit}
                onCancel={() => setShowPlanForm(false)}
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="ai-chips">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="ai-chip"
              onClick={() => handleAction(action.id)}
            >
              <action.icon size={14} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Message sub-components ── */

function UserMessage({ content }) {
  return <p className="ai-user-text">{content}</p>;
}

function InsightsCard({ data }) {
  return (
    <div className="ai-card">
      <p className="ai-summary">{data.summary}</p>
      <div className="ai-insights-grid">
        {data.insights.map((insight) => (
          <div key={insight.label} className="ai-insight-item">
            <span>{insight.label}</span>
            <strong>{insight.value}</strong>
          </div>
        ))}
      </div>
      <ConfidenceBadge level={data.confidence} />
    </div>
  );
}

function SavingsCard({ data, onViewAlternatives }) {
  return (
    <div className="ai-card">
      <p className="ai-summary">{data.summary}</p>
      {data.opportunities.length > 0 && (
        <div className="ai-opportunities">
          {data.opportunities.map((opp, i) => (
            <div key={i} className={`ai-opportunity ai-priority--${opp.priority}`}>
              <div className="ai-opp-header">
                <Lightbulb size={14} />
                <strong>{opp.title}</strong>
              </div>
              <p>{opp.detail}</p>
              <p className="ai-suggestion">{opp.suggestion}</p>
              {opp.potentialSaving > 0 && (
                <span className="ai-saving-tag">
                  Potential saving: {formatCurrency(opp.potentialSaving)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {data.totalPotential > 0 && (
        <div className="ai-total-savings">
          <PiggyBank size={16} />
          <span>Total potential savings: <strong>{formatCurrency(data.totalPotential)}</strong></span>
        </div>
      )}
      <ConfidenceBadge level={data.confidence} />
    </div>
  );
}

function BudgetAnalysisCard({ data }) {
  return (
    <div className="ai-card">
      <p className="ai-summary">{data.summary}</p>
      {data.breakdown.length > 0 && (
        <div className="ai-breakdown">
          {data.breakdown.map((item) => (
            <div key={item.category} className="ai-breakdown-row">
              <div className="ai-breakdown-label">
                <span className="ai-color-dot" style={{ background: item.color }} />
                <span>{item.category}</span>
              </div>
              <div className="ai-breakdown-values">
                <span>{formatCurrency(item.spent)}</span>
                <span className={`ai-share ai-share--${item.status}`}>{item.share}%</span>
              </div>
              <div className="ai-breakdown-bar">
                <div
                  className={`ai-breakdown-fill ai-fill--${item.status}`}
                  style={{ width: `${Math.min(item.share, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {data.warnings.length > 0 && (
        <div className="ai-warnings">
          {data.warnings.map((w, i) => (
            <p key={i} className="ai-warning-text">⚠️ {w}</p>
          ))}
        </div>
      )}
      <ConfidenceBadge level={data.confidence} />
    </div>
  );
}

function BudgetPlanCard({ data }) {
  if (data.plan.length === 0) {
    return (
      <div className="ai-card">
        <p className="ai-summary">{data.summary}</p>
      </div>
    );
  }

  return (
    <div className="ai-card">
      <p className="ai-summary">{data.summary}</p>
      <div className="ai-plan-grid">
        {data.plan.map((item) => (
          <div key={item.category} className="ai-plan-item">
            <div className="ai-plan-header">
              <strong>{item.category}</strong>
              <span className="ai-plan-amount">{formatCurrency(item.allocated)}</span>
            </div>
            <div className="ai-plan-bar">
              <div className="ai-plan-fill" style={{ width: `${item.percentage * 2.5}%` }} />
            </div>
            <p className="ai-plan-tip">{item.tips}</p>
          </div>
        ))}
      </div>
      <ConfidenceBadge level={data.confidence} />
    </div>
  );
}

function AlternativesCard({ data }) {
  return (
    <div className="ai-card">
      <p className="ai-summary">{data.summary}</p>
      <div className="ai-alternatives">
        {data.alternatives.map((alt, i) => (
          <div key={i} className="ai-alt-row">
            <strong>{alt.option}</strong>
            <div className="ai-alt-meta">
              <span className="ai-saving-tag">Save {alt.saving}</span>
              <span className="ai-tradeoff">{alt.tradeoff}</span>
            </div>
          </div>
        ))}
      </div>
      <ConfidenceBadge level={data.confidence} />
    </div>
  );
}

function PlanFormInline({ form, onChange, onSubmit, onCancel }) {
  return (
    <form className="ai-plan-form" onSubmit={onSubmit}>
      <p className="ai-greeting">Where are you heading? Set your budget and travel style.</p>
      <div className="ai-input-group">
        <input
          type="text"
          placeholder="Destination (e.g., Japan)"
          value={form.destination}
          onChange={(e) => onChange({ ...form, destination: e.target.value })}
        />
        <input
          type="number"
          placeholder="Total budget"
          min="1"
          value={form.budget}
          onChange={(e) => onChange({ ...form, budget: e.target.value })}
          required
        />
      </div>
      <div className="ai-style-selector">
        {styleOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`ai-style-btn ${form.style === opt.id ? "ai-style-btn--active" : ""}`}
            onClick={() => onChange({ ...form, style: opt.id })}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
      <div className="ai-form-actions">
        <button type="submit" className="ai-submit-btn">Generate plan</button>
        <button type="button" className="ai-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ConfidenceBadge({ level }) {
  return (
    <div className="ai-confidence">
      <span className={`ai-confidence-dot ai-confidence--${level.toLowerCase()}`} />
      <span>{level} confidence</span>
    </div>
  );
}
