export interface ExtensionFormProps {
  onConnect?: (extensionName: string) => void;
}

export interface SipConfig {
  username: string;
  password: string;
  domain: string;
}

export type ConnectStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "FAILED";

export type CallState = "IDLE" | "RINGING" | "CALLING" | "IN_CALL";

export interface PeerConnectionHandler {
  peerConnection?: RTCPeerConnection;
}

export interface SipConfig {
  username: string;
  password: string;
  domain: string;
}

export interface PeerConnectionHandler {
  peerConnection?: RTCPeerConnection;
}

export interface CallPanelProps {
  callState: CallState;
  incomingFrom: string;
  onCall: (number: string) => void;
  onAccept: () => void;
  onHangup: () => void;
}
