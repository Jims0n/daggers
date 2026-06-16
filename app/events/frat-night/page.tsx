import { getEventBySlug } from '@/lib/actions/event.action';
import { notFound } from 'next/navigation';
import FratNightClient from './frat-night-client';

export default async function FratNightPage() {
  const event = await getEventBySlug('frat-night');
  if (!event || !event.isActive) return notFound();

  return <FratNightClient event={event} />;
}
