
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 0 || dateStr === "Nyss") return "Nyss";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('sv-SE', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const cardHeader = (task, {isDone, isClosed}) =>
{
  const headerRow = document.createElement("div");
  headerRow.className = "card-header-row";

  const dateRow = document.createElement("div");
  dateRow.className = "date-row";
  dateRow.innerHTML = `
    <div class="meta-item"><span class="meta-label">SKAPAD</span><span class="meta-value">${formatDate(task.createdAt)}</span></div>
  `;

  if (task.deadline) {
    const isOverdue = new Date(task.deadline) < new Date() && !isDone && !isClosed;
    dateRow.innerHTML += `
      <div class="meta-item ${isOverdue ? "deadline-overdue" : ""}">
        <span class="meta-label">DEADLINE</span><span class="meta-value">${formatDate(task.deadline)}</span>
      </div>
    `;
  }

  const badge = document.createElement("div");
  badge.className = "statusBadge hero-badge";
  badge.setAttribute("data-status", task.status);
  badge.textContent = task.status;

  headerRow.append(dateRow, badge);
  return headerRow;
}
