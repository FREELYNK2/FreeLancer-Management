export const filterByBudget = (budgetString, filter) => {
  if (!filter) return true;
  const amount = parseInt(budgetString.replace(/[^0-9]/g, ""));
  if (isNaN(amount)) return false;

  switch (filter) {
    case "0-1000":
      return amount <= 1000;
    case "1000-5000":
      return amount > 1000 && amount <= 5000;
    case "5000+":
      return amount > 5000;
    default:
      return true;
  }
};

export const filterByDuration = (durationString, filter) => {
  if (!filter) return true;
  const days = parseInt(durationString.replace(/[^0-9]/g, ""));
  if (isNaN(days)) return false;

  switch (filter) {
    case "1-7":
      return days <= 7;
    case "8-30":
      return days > 7 && days <= 30;
    case "30+":
      return days > 30;
    default:
      return true;
  }
};

export const filterByRate = (rateString, filter) => {
  if (!filter) return true;
  const rate = parseInt(rateString.replace(/[^0-9]/g, ""));
  if (isNaN(rate)) return false;

  switch (filter) {
    case "0-500":
      return rate <= 500;
    case "500-1000":
      return rate > 500 && rate <= 1000;
    case "1000+":
      return rate > 1000;
    default:
      return true;
  }
};

export const filterByExperience = (experienceString, filter) => {
  if (!filter) return true;
  const years = parseInt(experienceString.split(" ")[0]);
  if (isNaN(years)) return false;

  switch (filter) {
    case "1-3":
      return years >= 1 && years <= 3;
    case "4-7":
      return years >= 4 && years <= 7;
    case "8+":
      return years >= 8;
    default:
      return true;
  }
};
