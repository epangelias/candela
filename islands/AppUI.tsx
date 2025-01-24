import ChatBox from '@/islands/ChatBox.tsx';
import { ChatData } from '@/app/types.ts';
import InfoBible from 'tabler-icons/bible';
import ChatIcon from 'tabler-icons/message-circle';
import WordsIcon from 'tabler-icons/brain';
import SearchIcon from 'tabler-icons/search';
import OptionsIcon from 'tabler-icons/settings';
import { useComputed, useSignal } from '@preact/signals';
import { UserUI } from '@/islands/UserUI.tsx';

export function AppUI({ chatData }: { chatData: ChatData }) {
  const tabs = [
    {
      title: 'Texts',
      content: <p>Texts</p>,
      icon: InfoBible,
    },
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
      title: 'Verse Search',
      content: <p>Search</p>,
      icon: SearchIcon,
    },
    {
      title: 'Options',
      content: <UserUI />,
      icon: OptionsIcon,
    },
  ];

  const currentTabID = useSignal(0);

  const currentTab = useComputed(() => tabs[currentTabID.value]);

  return (
    <div class='app-ui'>
      <div class='views'>
        {tabs.map((tab, id) => <div class='view' data-current={id == currentTabID.value}>{tab.content}</div>)}
      </div>

      <div class='tabs'>
        {tabs.map((tab, id) => (
          <button data-selected={currentTabID.value == id} onClick={() => currentTabID.value = id}>
            <span class='title'>{tab.title}</span> <tab.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
