"use client";

import { useNode, type UserComponent } from "@craftjs/core";
import { craftRef } from "@/features/events/builder/craft-utils";
import type { ReactNode } from "react";

interface ContainerProps {
  backgroundColor: string;
  padding: number;
  children?: ReactNode;
}

export const EmailContainer: UserComponent<ContainerProps> = ({
  backgroundColor = "transparent",
  padding = 0,
  children,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <div
      ref={craftRef(connect, drag)}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        minHeight: "40px",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

EmailContainer.craft = {
  displayName: "Container",
  props: {
    backgroundColor: "transparent",
    padding: 0,
  },
};
