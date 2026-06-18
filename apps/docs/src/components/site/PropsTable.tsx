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
    <div id="props" className="overflow-x-auto border border-border-hairline">
      <table className="w-full text-sm font-mono border-collapse">
        <thead>
          <tr className="border-b border-border-hairline bg-surface-charcoal">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 text-text-muted font-normal text-xs tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} className="border-b border-border-hairline">
              <td className="py-3 px-4">
                <span className="text-white">{prop.name}</span>
                {prop.required && (
                  <span className="ml-1 text-red-400 text-xs">*</span>
                )}
              </td>
              <td className="py-3 px-4 text-text-muted">{prop.type}</td>
              <td className="py-3 px-4 text-text-muted">
                {prop.default ? (
                  <code className="text-xs bg-surface-charcoal border border-border-hairline px-1.5 py-0.5">{prop.default}</code>
                ) : (
                  <span className="text-text-muted/40">&mdash;</span>
                )}
              </td>
              <td className="py-3 px-4 text-text-muted font-body">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
