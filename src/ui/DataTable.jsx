import React from 'react';

export default function DataList({ data }) {
  const headers = [
    'Date', 'Day', 'Network', 'Offer Name', '@', 'Inbox',
    'NC', 'L', '$', 'EPC', 'eCPM', 'Conv', 'CTR',
    'From', 'Subject', 'Sub ID'
  ];

  const parseData = (rawData) => {
    if (!rawData?.trim()) return [];
    return rawData.trim().split('\n').map(row => row.split('\t'));
  };

  const rows = parseData(data);

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="data-row">
          {row.map((cell, cellIndex) => {
            if (cell === '' || cell === '#DIV/0!') return null; // Skip these fields
            return (
              <div key={cellIndex} className="data-cell">
                <p style={{ textAlign: 'left' }}><strong>{headers[cellIndex]}:</strong> {cell || '-'}</p>
              </div>
            );
          })}
        </div>
      ))}
      {rows.length === 0 && (
        // <div className="no-data">No data available</div>
        <></>
      )}
    </div>
  );
}
