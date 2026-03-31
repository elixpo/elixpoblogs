'use client';

import { use } from 'react';
import HandlePage from '../../src/pages/HandlePage';

// This catch-all handles:
// /username → user profile
// /orgname → org profile
// It also handles short blog links /slugid if the name doesn't resolve as user/org
export default function SlugPage({ params }) {
  const { slugid } = use(params);
  return <HandlePage path={[slugid]} />;
}
