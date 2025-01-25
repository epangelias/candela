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

export function AppUI({ chatData }: { chatData: ChatData }) {
  const tabs = [
    {
      title: 'Chat',
      content: <ChatBox data={chatData} />,
      icon: ChatIcon,
    },
    {
      title: 'Words',
      content: <p>Words</p>,
      icon: WordsIcon,
    },
    {
      title: 'Texts',
      content: <p>Texts</p>,
      icon: InfoBible,
    },
    {
      title: 'Search',
      content: <SearchUI />,
      icon: SearchIcon,
    },
    {
      title: 'Options',
      content: <UserUI />,
      icon: OptionsIcon,
    },
  ];

  function getTabFromHash() {
    const data = localStorage.getItem('current-tab');
    return data ? +data : 0;
  }

  const currentTabID = useSignal(getTabFromHash());

  function setTab(id: number) {
    currentTabID.value = id;
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
