import { ShieldCheck, Truck, Repeat, CreditCard } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ₦200,000" },
  { icon: CreditCard, title: "Secure Payment", desc: "100% secure transactions" },
  { icon: ShieldCheck, title: "Quality Guarantee", desc: "Premium materials always" },
  { icon: Repeat, title: "Easy Returns", desc: "14-day hassle-free returns" },
];

const IconBoxes = () => {
  return (
    <section className="border-t border-border/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center">
              <f.icon className="h-6 w-6 mb-3 text-muted-foreground" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold uppercase tracking-wider">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IconBoxes;