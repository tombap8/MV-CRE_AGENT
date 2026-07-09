const BAR_HEIGHTS = [
  20, 35, 55, 40, 65, 80, 50, 30, 45, 70, 90, 60, 40, 55, 75, 95, 70, 50, 35,
  60, 85, 65, 45, 30, 50, 75, 100, 80, 55, 40, 25, 45, 70, 90, 65, 50, 35, 55,
  80, 60, 40, 30, 50, 70, 85, 60, 45, 30, 20, 35, 55, 40, 25, 15,
];

export { BAR_HEIGHTS };

export function Waveform({
  className = "",
  barClassName = "bg-stone",
}: {
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={`flex h-24 items-center gap-[3px] ${className}`}>
      {BAR_HEIGHTS.map((height, i) => (
        <span
          key={i}
          className={`w-1 flex-none rounded-full ${barClassName}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}
