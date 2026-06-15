export interface Prop {
  name: string;
  type: string;
  default?: string;
  description: string;
  required: boolean;
}

export function PropsTable({ props }: { props: Prop[] }) {
  if (!props.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                className="text-left py-2 pr-6 text-white/30 font-normal text-xs tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-white/5">
              <td className="py-3 pr-6">
                <span className="text-white">{prop.name}</span>
                {prop.required && (
                  <span className="ml-1 text-red-400 text-xs">*</span>
                )}
              </td>
              <td className="py-3 pr-6 text-violet-400">{prop.type}</td>
              <td className="py-3 pr-6 text-white/30">
                {prop.default ?? "—"}
              </td>
              <td className="py-3 pr-6 text-white/50 font-sans">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}