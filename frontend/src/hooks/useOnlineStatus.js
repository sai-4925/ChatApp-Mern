import useSocket from './useSocket';

/**
 * Returns whether a given userId is currently online, based on the live
 * presence set maintained by SocketContext.
 */
const useOnlineStatus = (userId) => {
  const { onlineUserIds } = useSocket();
  return userId ? onlineUserIds.has(userId) : false;
};

export default useOnlineStatus;
