import { site } from '@/app/site.ts';
import { asset } from 'fresh/runtime';

export function WelcomeSection() {
  return (
    <div class='onboard-section'>
      <img src={asset(site.icon)} alt='' height={84} />
      <h1>Welcome to {site.name}!</h1>
      <p>{site.description}</p>
      <br />
      <a href='/user/signup' class='button'>Get Started</a>
    </div>
  );
}
