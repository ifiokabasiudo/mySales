type Period = "daily" | "weekly" | "monthly" | "yearly";

// export function getTimeRange(period: Period, date = new Date()) {
//   const start = new Date(date);
//   const end = new Date(date);

//   switch (period) {
//     case "daily":
//       start.setHours(0, 0, 0, 0);
//       end.setHours(23, 59, 59, 999);
//       break;

//     case "weekly":
//       const day = start.getDay(); // 0 = Sun
//       const diff = start.getDate() - day;
//       start.setDate(diff);
//       start.setHours(0, 0, 0, 0);

//       end.setDate(start.getDate() + 6);
//       end.setHours(23, 59, 59, 999);
//       break;

//     case "monthly":
//       start.setDate(1);
//       start.setHours(0, 0, 0, 0);

//       end.setMonth(start.getMonth() + 1, 0);
//       end.setHours(23, 59, 59, 999);
//       break;

//     case "yearly":
//       start.setMonth(0, 1);
//       start.setHours(0, 0, 0, 0);

//       end.setMonth(11, 31);
//       end.setHours(23, 59, 59, 999);
//       break;
//   }

//   return { start, end };
// }


export function getTimeRange(period: Period, date = new Date()) {
  const end = new Date(date);
  const start = new Date(date);

  switch (period) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "weekly":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case "monthly":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;

    case "yearly":
      start.setDate(start.getDate() - 364);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}
