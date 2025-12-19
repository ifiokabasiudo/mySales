const cards = [
  {
    name: "Today's Sales",
    links: [
      { name: "Sales History", href: "#", isButton: false },
      { name: "Add Sales", href: "#", isButton: true },
    ],
    value: 52342.56,
  },
  {
    name: "Today's Expenses",
    links: [
      { name: "Expense History", href: "#", isButton: false },
      { name: "Add Expense", href: "#", isButton: true },
    ],
    value: 38450.43,
  },
  {
    name: "Today's Profit",
    links: [
      { name: "Profit History", href: "#", isButton: false },
      { name: "", href: "" },
    ],
    value: 13892.13,
  },
];
// ₦

export default function DashboardCards() {
  return (
    <div className="flex flex-col gap-4 mt-25 px-5 tracking-wide">
      {cards.map((card, i) => (
        <div key={i} className="bg-green-700 text-white rounded-xl p-4 shadow">
          <div className="flex justify-between">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm opacity-90">{card.name}</h3>
              <p className="text-xl font-bold">
                ₦{Number(card.value).toLocaleString()}
              </p>
            </div>
            <div className={`flex flex-col gap-3 text-sm`}>
              {card.links.map((link, idx) =>
                link.name ? (
                  <a
                    key={idx}
                    href={link.href}
                    className={`${link.isButton ? "bg-white text-green-700 px-3 py-1 rounded-full hover:bg-slate-200 transition-colors" : "text-right hover:text-slate-200"}`}
                  >
                    {`${link.isButton ? `+` : "" } ${link.name}`}
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
