"use client";
import Link from "next/link";

export default function BackBar({ href = "/", label = "Back" }: { href?: string; label?: string }) {
  return (
    <div className="p-3 border-b flex items-center gap-3">
      <Link href={href} className="underline">
        ← {label}
      </Link>
    </div>
  );
}
