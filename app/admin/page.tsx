import {isAdmin} from '@/lib/server';
import Admin from '@/components/Admin';
export const metadata={title:'Управление — VELA',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Page(){return <Admin authenticated={await isAdmin()}/>}
