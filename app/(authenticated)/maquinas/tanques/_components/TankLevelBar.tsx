import { useEffect, useState } from "react";

type TankLevelBarProps = {
  capacity: number;
  stock: number;
};

export function TankLevelBar({ capacity, stock }: TankLevelBarProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  const percentage =
    capacity > 0 ? Math.min((stock / capacity) * 100, 100) : 0;

  useEffect(() => {
    // Pequeno delay pra dar aquele efeito gráfico
    const timeout = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);

    return () => clearTimeout(timeout);
  }, [percentage]);

  const getColor = () => {
    if (percentage > 75) return "bg-green";
    if (percentage > 50) return "bg-yellow-400";
    if (percentage > 25) return "bg-orange-500";
    return "bg-red";
  };

  return (
    <div className="w-full space-y-1 flex items-center justify-center gap-4">
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`
            h-full 
            ${getColor()} 
            transition-all 
            duration-700 
            ease-out
          `}
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>
    </div>
  );
}
