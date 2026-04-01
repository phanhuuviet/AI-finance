const getTargetNode = (target) => {
  if (typeof document === "undefined") {
    return null;
  }

  if (
    (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) ||
    (typeof SVGElement !== "undefined" && target instanceof SVGElement)
  ) {
    return target;
  }

  if (typeof target === "string") {
    return document.querySelector(target) || document.body;
  }

  return document.body;
};

export function portal(node, target = "body") {
  let currentTarget = getTargetNode(target);

  if (currentTarget) {
    currentTarget.appendChild(node);
  }

  return {
    update(newTarget) {
      const nextTarget = getTargetNode(newTarget);
      if (!nextTarget || nextTarget === currentTarget) {
        return;
      }

      if (currentTarget?.contains(node)) {
        currentTarget.removeChild(node);
      }

      currentTarget = nextTarget;
      currentTarget.appendChild(node);
    },
    destroy() {
      if (currentTarget?.contains(node)) {
        currentTarget.removeChild(node);
      }
    }
  };
}
