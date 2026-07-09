import { useParams } from 'react-router-dom';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import MobileNav from '../components/layout/MobileNav';

/**
 * On desktop (lg+): sidebar and chat window side by side, always both visible.
 * On mobile: only one pane shows at a time — the chat list, or (once a
 * conversation is selected via the URL) the chat window full-screen.
 */
const DashboardLayout = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className={`w-full lg:w-[360px] lg:shrink-0 ${conversationId ? 'hidden lg:block' : 'block'}`}>
          <Sidebar />
        </div>
        <div className={`flex-1 ${conversationId ? 'block' : 'hidden lg:block'}`}>
          <ChatWindow />
        </div>
      </div>
      {!conversationId && <MobileNav />}
    </div>
  );
};

export default DashboardLayout;
