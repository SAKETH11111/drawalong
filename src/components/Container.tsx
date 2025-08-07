"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export default function Container({ as: Comp = "div", className, ...rest }: ContainerProps) {
  const C = Comp as React.ElementType;
  return <C className={cn("mx-auto max-w-6xl px-6", className)} {...rest} />;
}