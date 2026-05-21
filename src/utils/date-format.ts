export const formatDate = (orderDate: Date) => {
  const day = orderDate.getDate();

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return "th";

    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const month = orderDate.toLocaleString("en-US", { month: "short" });
  const year = orderDate.getFullYear();

  const time = orderDate.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return `${day}${getOrdinal(day)} ${month} ${year} ${time}`;
};
