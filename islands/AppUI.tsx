import ChatBox from '@/islands/ChatBox.tsx';
import { ChatData, WordsData } from '@/app/types.ts';
import InfoBible from 'tabler-icons/bible';
import ChatIcon from 'tabler-icons/message-circle';
import WordsIcon from 'tabler-icons/brain';
import SearchIcon from 'tabler-icons/search';
import OptionsIcon from 'tabler-icons/settings';
import { useSignal } from '@preact/signals';
import { UserUI } from '@/islands/UserUI.tsx';
import { SearchUI } from '@/islands/SearchUI.tsx';
import { IS_BROWSER } from 'fresh/runtime';
import { getContent } from '@/islands/Content.tsx';
import { useEffect } from 'preact/hooks';
import { useGlobal } from '@/islands/Global.tsx';
import { ComponentChildren } from 'preact';
import WordsUI from '@/islands/WordsUI.tsx';

export interface TabData {
  id: string;
  title: string;
  content: ComponentChildren;
  icon: ComponentChildren;
  passSelection: boolean;
}

export function AppUI({ chatData, wordsData }: { chatData: ChatData; wordsData: WordsData }) {
  const global = useGlobal();

  const tabs: TabData[] = [
    {
      id: 'chat',
      title: getContent('Chat'),
      content: <ChatBox data={chatData} />,
      icon: ChatIcon,
      passSelection: true,
    },
    {
      id: 'words',
      title: getContent('Words'),
      content: <WordsUI data={wordsData} />,
      icon: WordsIcon,
      passSelection: true,
    },
    {
      id: 'texts',
      title: getContent('Texts'),
      content: <p>Texts</p>,
      icon: InfoBible,
      passSelection: false,
    },
    {
      id: 'search',
      title: getContent('Search'),
      content: <SearchUI />,
      icon: SearchIcon,
      passSelection: true,
    },
    {
      id: 'options',
      title: getContent('Options'),
      content: <UserUI />,
      icon: OptionsIcon,
      passSelection: false,
    },
  ];

  function getTabFromHash() {
    if (!IS_BROWSER) return 2;
    const data = localStorage.getItem('current-tab');
    return data ? +data : 2;
  }

  useEffect(() => {
    setTab(getTabFromHash());
  }, []);

  function setTab(id: number) {
    global.pageState.currentTabId.value = id;
    if (!IS_BROWSER) return;
    localStorage.setItem('current-tab', id + '');
    const tab = tabs[id];
    global.pageState.currentTab.value = tab;
  }

  return (
    <div class='app-ui'>
      <div class='views'>
        {tabs.map((tab, id) => (
          <div class='view' data-current={id == global.pageState.currentTabId.value}>{tab.content}</div>
        ))}
      </div>

      <div class='tabs'>
        {tabs.map((tab, id) => (
          <button
            data-selected={global.pageState.currentTabId.value == id}
            onClick={() => setTab(id)}
            disabled={!tab.passSelection && !!global.pageState.selection.value && !global.pageState.selectionUsed.value}
          >
            <span class='title'>{tab.title}</span> <tab.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
