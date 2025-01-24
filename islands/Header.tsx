import { useGlobal } from '@/islands/Global.tsx';
import { site } from '@/app/site.ts';
import { UserMenu } from '@/islands/UserMenu.tsx';
import IconBolt from 'tabler-icons/bolt';
import IconBoltOff from 'tabler-icons/bolt-off';

export function Header() {
  const global = useGlobal();

  return (
    <>
      <header>
        <div class='left'>
          <a href='/' class='logo' aria-label='Go to home page'>
            <img src={site.icon} width={48} height={48} alt='' />
            <span>{site.name}</span>
          </a>
        </div>
        <div class='right'>
          {global.user.value && (
            <span class='tokens'>
              {}
              {global.user.value?.tokens! > 0
                ? <IconBolt width='24' height='24' />
                : <IconBoltOff width='24' height='24' />}
              {global.user.value.isSubscribed ? '∞' : (global.user.value?.tokens! > 0 && global.user.value.tokens)}
            </span>
          )}

          <UserMenu />
        </div>
      </header>
    </>
  );
}
