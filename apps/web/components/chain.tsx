export interface ChainProps {
  height?: string;
}

export function Chain({ height }: ChainProps) {
  return (
    <div className="flex items-center">
      <div className={"mr-1 h-2 w-2 rounded-full bg-pink-400"}></div>
      <div className="text-xs text-slate-600">{height ?? "-"}</div>
    </div>
  );
}
