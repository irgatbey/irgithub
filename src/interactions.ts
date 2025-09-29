let activePressableElement: Element | null = null;

function handlePress(event: TouchEvent | MouseEvent) {
  const target = event.target as HTMLElement;
  const pressableElement = target.closest(".pressable");

  if (pressableElement) {
    pressableElement.classList.add("press-active");
    activePressableElement = pressableElement;
  }
}

function handleRelease() {
  if (activePressableElement) {
    activePressableElement.classList.remove("press-active");
    activePressableElement = null;
  }
}

export function initializeGlobalInteractions() {
  document.body.addEventListener("mousedown", handlePress);
  document.body.addEventListener("touchstart", handlePress, { passive: true });

  document.body.addEventListener("mouseup", handleRelease);
  document.body.addEventListener("mouseleave", handleRelease);
  document.body.addEventListener("touchend", handleRelease);
}
