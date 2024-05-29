'use client'

import { PercentileEntry } from '@/lib/metrics';
import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default class MinMaxChart extends PureComponent<{ data: PercentileEntry }> {
  render() {
    const data = this.props.data.minMaxLatencies.map((t, idx) => ({
      Timestamp: new Date(t.timestamp).toLocaleString(),
      'Max Latency': this.props.data.minMaxLatencies[idx].max,
      'Min Latency': this.props.data.minMaxLatencies[idx].min
    }))
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey={'Timestamp'} fontSize={0}/>
          <Tooltip labelStyle={{color: 'black'}} />
          {/* <Legend verticalAlign="top" /> */}
          <Line type="monotone" dataKey="Min Latency" stroke="#00E699" dot={false} />
          <Line type="monotone" dataKey="Max Latency" stroke="#3395FF" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
