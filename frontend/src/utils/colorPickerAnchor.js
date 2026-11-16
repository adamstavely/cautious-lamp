/**
 * Where ColorPicker opens for the control that was clicked: just right of it,
 * level with its top, in viewport coordinates (the picker is a modal dialog in
 * the top layer). ColorPicker flips it to the control's left when there's no
 * room on the right and keeps it inside the screen using its real size.
 */
export function colorPickerAnchor(event) {
  const el = event?.currentTarget || event?.target;
  if (!el?.getBoundingClientRect) return { left: 16, top: 16 };
  const rect = el.getBoundingClientRect();
  return { left: rect.right + 16, top: rect.top, anchorLeft: rect.left };
}
