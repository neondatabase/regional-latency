import React, { useState, useEffect } from 'react';
import { PlatformConfig, QueryBenchmarkResponse } from '../types';
import PlatformResult from './platform-result';

function Platform ({ platform } : {platform: PlatformConfig}) {
  const els = platform.targets.map((target, idx) => {
    return <PlatformResult target={target} key={`platform-${platform.name}-${idx}`} />
  })
  return (
    <div className='py-4'>
      <h2 className='text-2xl mb-2'>{platform.name}</h2>
      <hr className='mb-3 mt-1' />
      <div className='entries flex'>{els}</div>
    </div>
  );
}

export default Platform ;
