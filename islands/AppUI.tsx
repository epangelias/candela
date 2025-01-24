import ChatBox from '@/islands/ChatBox.tsx';
import { ChatData } from '@/app/types.ts';
import { OutOfTokensDialog } from '@/islands/OutOfTokensDialog.tsx';
import InfoBible from 'tabler-icons/bible';
import ChatIcon from 'tabler-icons/message-circle';
import { useComputed, useSignal } from '@preact/signals';

export function AppUI({ chatData }: { chatData: ChatData }) {
  const tabs = [
    {
      title: 'Bible',
      content: <p>Bible</p>,
      icon: InfoBible,
    },
    {
      title: 'Chat',
      content: <ChatBox data={chatData} />,
      icon: ChatIcon,
    },
  ];

  const currentTabID = useSignal(0);

  const currentTab = useComputed(() => tabs[currentTabID.value]);

  return (
    <div class='app-ui'>
      <div class='view'>
        {currentTab.value.content}
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
