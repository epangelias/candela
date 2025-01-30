import { useSignal } from '@preact/signals';
import { TabData } from '@/islands/AppUI.tsx';

export class PageState {
  selection = useSignal('');
  selectionUsed = useSignal(true);
  currentTabId = useSignal(0);
  currentTab = useSignal<TabData | null>(null);
}
