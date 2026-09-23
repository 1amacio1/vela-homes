import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'VELA — дома для вашей жизни',description:'Строительство частных домов по всей России с 2005 года. Архитектура, строительство, интерьер и благоустройство.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
