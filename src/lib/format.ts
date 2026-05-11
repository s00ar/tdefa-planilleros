export const formatDateEs = (dateIso: string) => {
  const [y, m, d] = dateIso.split("-").map(Number);
  if (!y || !m || !d) return dateIso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
};

export const formatCompactDateTime = (dateIso: string, time: string) => {
  return `${formatDateEs(dateIso)} · ${time}hs`;
};

