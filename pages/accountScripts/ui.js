export function formatDate(dateValue) {
  if (!dateValue) return "Unknown date";
  try {
    const date = dateValue?.toDate?.() || new Date(dateValue);
    return date.toLocaleDateString();
  } catch {
    return "Unknown date";
  }
}

export function createActivityItem(action, date, status) {
  const item = document.createElement("li");
  item.className = "activity-item";
  item.textContent = `${action} on ${date} `;

  const statusIndicator = document.createElement("i");
  statusIndicator.className = `status-bubble status-${status}`;
  item.appendChild(statusIndicator);

  return item;
}

export function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    const errorItem = document.createElement("li");
    errorItem.className = "error";
    errorItem.textContent = message;
    element.appendChild(errorItem);
  }
}

export function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".activity-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.add("hidden"));

      const tabId = button.dataset.tab;
      button.classList.add("active");

      if (tabId === "all") {
        document.getElementById("allActivities").classList.remove("hidden");
      } else if (tabId === "applied") {
        document.getElementById("appliedActivities").classList.remove("hidden");
      } else if (tabId === "posted") {
        document.getElementById("postedActivities").classList.remove("hidden");
      } else if (tabId === "hires") {
        document.getElementById("hiresActivities").classList.remove("hidden");
      }
    });
  });
}

export function createModal(title, contentHTML) {
  const modal = document.createElement("section");
  modal.className = "modal";
  modal.innerHTML = `
      <h3>${title}</h3>
      ${contentHTML}
      <button class="close-modal">Close</button>
    `;

  //  close handler
  modal.querySelector(".close-modal").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  return modal;
}
