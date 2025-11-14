import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#63B926", "#FF6467"]; // verde e vermelho

const UseByCultivarChart = ({
  descartado,
  aproveitado,
}: {
  descartado: number;
  aproveitado: number;
}) => {
  const data = [
    { name: "Semente", value: aproveitado },
    { name: "Descartado", value: descartado },
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow max-w-lg">
      <h3>Aproveitamento por cultivar</h3>
      <ResponsiveContainer width="100%" height={373}>
        <PieChart className="font-light text-xs">
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            paddingAngle={2}
            isAnimationActive={true}
            labelLine={false}
            label={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value} kg`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UseByCultivarChart;
