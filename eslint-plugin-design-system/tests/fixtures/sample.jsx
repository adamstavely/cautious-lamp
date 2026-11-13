import React from 'react';

const MAX_ITEMS = 10;
const _cache = new Map();
const $root = document.getElementById('root');

export const Primary_Button = ({ label }) => (
  <button style={{ color: '#3b82f6', padding: '8px 16px', fontSize: '14px' }}>{label}</button>
);

export function IconButton() {
  return <button />;
}

export const Card = () => <div className="card">{MAX_ITEMS}</div>;
