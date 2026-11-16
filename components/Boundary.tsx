"use client";

import { Component, type ReactNode } from "react";

type Props = {
  /** Called once when something below throws, or a lazy chunk fails to load. */
  onError: () => void;
  children: ReactNode;
};

/**
 * Contains a failure in an optional layer (the Field, the command palette)
 * so that it costs the visitor that layer and nothing else. The Brief is
 * server-rendered and stays readable whatever happens here.
 */
export class Boundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
