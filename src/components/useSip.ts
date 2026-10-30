'use client';

import { useRef, useState } from 'react';
import { ConnectStatus, SipConfig } from '@/components/types';

export function useSip() {
  const uaRef = useRef<import('sip.js').UserAgent | null>(null);
  const registererRef = useRef<import('sip.js').Registerer | null>(null);
  const [status, setStatus] = useState<ConnectStatus>('DISCONNECTED');

  const connect = async (config: SipConfig) => {
    try {
      setStatus('CONNECTING');
      const { UserAgent, Registerer } = await import('sip.js');

      const uri = UserAgent.makeURI(`sip:${config.username}@${config.domain}`);
      if (!uri) throw new Error('Invalid SIP URI');

      const ua = new UserAgent({
        uri,
        transportOptions: { server: `wss://${config.domain}:7443/ws` },
        authorizationUsername: config.username,
        authorizationPassword: config.password,
      });

      await ua.start();
      const registerer = new Registerer(ua, { expires: 120 });
      await registerer.register();

      uaRef.current = ua;
      registererRef.current = registerer;
      setStatus('CONNECTED');
    } catch (err) {
      console.error('SIP connect failed', err);
      setStatus('FAILED');
    }
  };

  const disconnect = async () => {
    await registererRef.current?.unregister().catch(() => {});
    await uaRef.current?.stop().catch(() => {});
    uaRef.current = null;
    registererRef.current = null;
    setStatus('DISCONNECTED');
  };

  return { status, connect, disconnect };
}