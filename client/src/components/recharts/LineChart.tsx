import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import type { FC } from 'react';
import type { ImplicitLabelType } from 'recharts/types/component/Label';
// #endregion
type IndexLineChartT = {
  data: Record<string, string | number>[]
  xKey: string
  maxWidth: number
  yLabel: ImplicitLabelType | undefined
  xLabel: ImplicitLabelType | undefined
}
const colors = ["#001845", "#0077b6", "#00b4d8", "#2ec4b6", "#40916c"];
export const IndexLineChart: FC<IndexLineChartT> = ({ data, xKey, maxWidth, yLabel, xLabel  }) => {
  if(data.length == 0) return <></>
  return (
    <LineChart style={{ width: '100%', aspectRatio: 1.618, maxWidth }} margin={{left: 0, bottom: 10}} responsive data={data}>
      <Tooltip wrapperStyle={{
        zIndex: 100
      }}/>
      <CartesianGrid stroke="var(--color-border-3)" strokeDasharray="5 5" />
      <YAxis width="auto" label={yLabel}/>
      <XAxis height={40} dataKey={xKey} label={xLabel}/>
      {
        Object.keys(data[0]).filter(e => e != xKey).map((e, i) => (
          <Line
            key={i}
            type="linear"
            dataKey={e}
            stroke={colors[i % colors.length]}
          />
        ))
      }
      <Legend
        position="insideTopRight"
        offset={20}
        wrapperStyle={{
          border: '1px solid var(--color-border-3)',
          borderRadius: 5,
          padding: '1ex',
          background: 'var(--color-surface-base)',
        }}
      />
      <RechartsDevtools />
    </LineChart>
  );
}