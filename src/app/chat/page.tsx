"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

function Header() {
  console.log("Header", Math.random());
  return <div>Header</div>;
}

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Header />
      {count}
      <Button onClick={() => setCount(count + 1)}>Click me</Button>
    </div>
  );
}
