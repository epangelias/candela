import { define } from '@/lib/utils/utils.ts';
import { page } from 'fresh';
import { Page } from '@/components/Page.tsx';
import { getChatData } from '@/app/chat-data.ts';
import { WelcomeSection } from '@/components/WelcomeSection.tsx';
import { AppUI } from '@/islands/AppUI.tsx';
import { getWordsData } from '@/app/words-data.ts';

export const handler = define.handlers({
  GET: async (ctx) => {
    if (!ctx.state.user) return page();
    const chatData = await getChatData(ctx.state.user);
    const wordsData = await getWordsData(ctx.state.user);
    return page({ chatData, wordsData });
  },
});

export default define.page<typeof handler>(({ data }) => {
  return (
    <Page hideHeader={!data?.chatData} hideBanner={!data?.chatData} fullWidth={!!data?.chatData}>
      {data?.chatData ? <AppUI chatData={data?.chatData} wordsData={data?.wordsData} /> : <WelcomeSection />}
    </Page>
  );
});
