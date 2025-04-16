import React from 'react';

export default function Cursor({cursor = "|"}: {cursor?: string}) {
  return (
    <span className="inline-block h-5 bg-current animate-cursor">{cursor}</span>
  );
};
