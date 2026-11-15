// Lucide components for the icon names the API sends in component metadata
// (see getComponentMetadata in the backend). Only these are bundled; any other
// name shows Blocks.
import {
  Blocks,
  ChevronDown,
  ChevronRight,
  Info,
  LayoutGrid,
  Maximize,
  Menu,
  Navigation,
  PanelLeftClose,
  RectangleHorizontal,
  Table2,
  TextCursorInput,
} from 'lucide-vue-next';

const COMPONENT_ICONS = {
  'blocks': Blocks,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'info': Info,
  'layout-grid': LayoutGrid,
  'maximize': Maximize,
  'menu': Menu,
  'navigation': Navigation,
  'panel-left-close': PanelLeftClose,
  'rectangle-horizontal': RectangleHorizontal,
  'table-2': Table2,
  'text-cursor-input': TextCursorInput,
};

export const COMPONENT_ICON_NAMES = Object.keys(COMPONENT_ICONS);

export function componentIcon(name) {
  return COMPONENT_ICONS[name] || Blocks;
}
