export const formatDateEs = (dateIso: string) => {
  const [year, month, day] = dateIso.split("-").map(Number);
  if (!year || !month || !day) return dateIso;

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

export const formatCompactDateTime = (dateIso: string, time: string) => {
  return `${formatDateEs(dateIso)} - ${time}hs`;
};
