import ChatBox from '@/islands/ChatBox.tsx';
import { ChatData } from '@/app/types.ts';
import { OutOfTokensDialog } from '@/islands/OutOfTokensDialog.tsx';

export function AppUI({ chatData }: { chatData: ChatData }) {
  return (
    <>
      <ChatBox data={chatData} />
      <OutOfTokensDialog />
    </>
  );
}
