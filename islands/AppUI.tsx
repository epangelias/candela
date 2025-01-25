import ChatBox from '@/islands/ChatBox.tsx';
import { ChatData } from '@/app/types.ts';
import InfoBible from 'tabler-icons/bible';
import ChatIcon from 'tabler-icons/message-circle';
import WordsIcon from 'tabler-icons/brain';
import SearchIcon from 'tabler-icons/search';
import OptionsIcon from 'tabler-icons/settings';
import { useComputed, useSignal } from '@preact/signals';
import { UserUI } from '@/islands/UserUI.tsx';
import { SearchUI } from '@/islands/SearchUI.tsx';
import { IS_BROWSER } from 'fresh/runtime';
import { getContent } from '@/islands/Content.tsx';

export function AppUI({ chatData }: { chatData: ChatData }) {
  const tabs = [
    {
      title: getContent('Chat'),
      content: <ChatBox data={chatData} />,
      icon: ChatIcon,
    },
    {
      title: getContent('Words'),
      content: <p>Words</p>,
      icon: WordsIcon,
    },
    {
      title: getContent('Texts'),
      content: <p>Texts</p>,
      icon: InfoBible,
    },
    {
      title: getContent('Search'),
      content: <SearchUI />,
      icon: SearchIcon,
    },
    {
      title: getContent('Options'),
      content: <UserUI />,
      icon: OptionsIcon,
    },
  ];

  function getTabFromHash() {
    if (!IS_BROWSER) return 0;
    const data = localStorage.getItem('current-tab');
    return data ? +data : 0;
  }

  const currentTabID = useSignal(getTabFromHash());

  function setTab(id: number) {
    currentTabID.value = id;
    if (!IS_BROWSER) return;
    localStorage.setItem('current-tab', id + '');
  }

  return (
    <div class='app-ui'>
      <div class='views'>
        {tabs.map((tab, id) => <div class='view' data-current={id == currentTabID.value}>{tab.content}</div>)}
      </div>

      <div class='tabs'>
        {tabs.map((tab, id) => (
          <button data-selected={currentTabID.value == id} onClick={() => setTab(id)}>
            <span class='title'>{tab.title}</span> <tab.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
