import React from 'react'

const ChartItem = ({
  date,
  open,
  high,
  low,
  close,
  volume,
  stockIsUp
  // unadjustedVolume,
  // change,
  // changePercent,
  // vwap,
  // label,
  // changeOverTime
}) => {
  const change = Math.abs(((close-open)*100/open).toFixed(3));
  return (
    <tr>
      <th scope="row">{date}</th>
      <td>{open}</td>
      <td>{high}</td>
      <td>{low}</td>
      <td>{close}</td>
      <td className={!stockIsUp ? 'text-success' : 'text-danger'}>
        {
          !stockIsUp ? String.fromCharCode(9650)+' '+change+'%' : String.fromCharCode(9660)+' '+change+'%'
        }
      </td>
    </tr>
  )
}

export default ChartItem
