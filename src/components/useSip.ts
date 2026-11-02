"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Inviter,
  Invitation,
  Registerer,
  Session,
  SessionState,
  UserAgent,
} from "sip.js";
import {
  CallState,
  ConnectStatus,
  PeerConnectionHandler,
  SipConfig,
} from "@/components/types";

export function useSip() {
  const uaRef = useRef<UserAgent | null>(null);
  const registererRef = useRef<Registerer | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const domainRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] = useState<ConnectStatus>("DISCONNECTED");
  const [callState, setCallState] = useState<CallState>("IDLE");
  const [incomingFrom, setIncomingFrom] = useState<string>("");

  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  const resetCall = () => {
    sessionRef.current = null;
    setCallState("IDLE");
    setIncomingFrom("");
  };

  const attachMedia = (session: Session) => {
    const handler =
      session.sessionDescriptionHandler as unknown as PeerConnectionHandler;
    const pc = handler?.peerConnection;
    const audio = audioRef.current;
    if (!pc || !audio) return;

    const remoteStream = new MediaStream();
    pc.getReceivers().forEach((r) => {
      if (r.track) remoteStream.addTrack(r.track);
    });
    audio.srcObject = remoteStream;
    audio.play().catch((e) => console.warn("Autoplay blocked", e));
  };

  const attachSession = (session: Session) => {
    session.stateChange.addListener((state: SessionState) => {
      switch (state as string) {
        case "Established":
          setCallState("IN_CALL");
          attachMedia(session);
          break;
        case "Terminated":
          if (sessionRef.current === session) resetCall();
          break;
      }
    });
  };

  const connect = async (config: SipConfig) => {
    if (uaRef.current) return;
    try {
      setStatus("CONNECTING");
      const { UserAgent, Registerer } = await import("sip.js");
      domainRef.current = config.domain;

      const uri = UserAgent.makeURI(`sip:${config.username}@${config.domain}`);
      if (!uri) throw new Error("Invalid SIP URI");

      const ua = new UserAgent({
        uri,
        transportOptions: { server: `wss://${config.domain}:7443/ws` },
        authorizationUsername: config.username,
        authorizationPassword: config.password,
        delegate: {
          onInvite: (invitation: Invitation) => {
            if (sessionRef.current) {
              invitation.reject({ statusCode: 486 }).catch(() => {}); // 486 = Busy Here
              return;
            }
            sessionRef.current = invitation;
            setIncomingFrom(invitation.remoteIdentity.uri.user ?? "Unknown");
            setCallState("RINGING");
            attachSession(invitation);
          },
        },
        sessionDescriptionHandlerFactoryOptions: {
          peerConnectionOptions: {
            rtcConfiguration: {
              iceServers: [
                { urls: process.env.NEXT_PUBLIC_STUN_URL ?? "" },
                {
                  urls: process.env.NEXT_PUBLIC_TURN_URL ?? "",
                  username: process.env.NEXT_PUBLIC_TURN_USERNAME ?? "",
                  credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL ?? "",
                },
              ],
            },
          },
        },
      });

      await ua.start();
      const registerer = new Registerer(ua, { expires: 120 });
      await registerer.register();

      uaRef.current = ua;
      registererRef.current = registerer;
      setStatus("CONNECTED");
    } catch (err) {
      console.error("SIP connect failed", err);
      setStatus("FAILED");
    }
  };

  const call = async (number: string) => {
    if (!uaRef.current || sessionRef.current) return;
    const { Inviter, UserAgent } = await import("sip.js");

    const target = UserAgent.makeURI(`sip:${number}@${domainRef.current}`);
    if (!target) return;

    const inviter = new Inviter(uaRef.current, target, {
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false },
      },
    });
    sessionRef.current = inviter;
    setCallState("CALLING");
    attachSession(inviter);
    await inviter.invite();
  };

  const accept = async () => {
    const invitation = sessionRef.current as Invitation | null;
    await invitation?.accept({
      sessionDescriptionHandlerOptions: {
        constraints: { audio: true, video: false },
      },
    });
  };

  const hangup = async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      if (session.state === "Established") await session.bye();
      else if ("reject" in session) await (session as Invitation).reject();
      else if ("cancel" in session) await (session as Inviter).cancel();
    } catch (e) {
      console.error("Hangup error", e);
    }
    resetCall();
  };

  const disconnect = async () => {
    await registererRef.current?.unregister().catch(() => {});
    await uaRef.current?.stop().catch(() => {});
    uaRef.current = null;
    registererRef.current = null;
    resetCall();
    setStatus("DISCONNECTED");
  };

  return {
    status,
    connect,
    disconnect,
    callState,
    incomingFrom,
    call,
    accept,
    hangup,
  };
}
