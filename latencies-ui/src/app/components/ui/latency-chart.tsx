'use client'

import { PercentileEntry } from '@/lib/metrics';
import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default class MinMaxChart extends PureComponent<{ data: PercentileEntry }> {
  render() {
    const data = this.props.data.resultTimestamps.map((timestamp, idx) => ({
      Timestamp: new Date(timestamp).toLocaleString(),
      'Max Latency': this.props.data.maxTimes[idx],
      'Min Latency': this.props.data.minTimes[idx]
    }))
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            // top: 5,
            // right: 5,
            // left: 5,
            // bottom: 5,
          }}
        >
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis dataKey={'Timestamp'} fontSize={0}/>
          {/* <YAxis /> */}
          <Tooltip labelStyle={{color: 'black'}} />
          <Legend />
          <Line type="monotone" dataKey="Min Latency" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="Max Latency" stroke="#8884d8" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
