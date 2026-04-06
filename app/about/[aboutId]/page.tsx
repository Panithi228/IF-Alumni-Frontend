'use client';

import { use, useEffect } from "react";

export default function AboutId({ params }: { params: Promise<{ aboutId: string }> }) {
    const resolvedParams = use(params);
    const aboutId = resolvedParams.aboutId;
    
    useEffect(() => {
        console.log("This is params: ", params);
    }, [params]);
    
  return (
    <h1>This is About Page with ID: {aboutId} 😀</h1>
  );
}