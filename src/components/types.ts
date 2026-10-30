export interface ExtensionFormProps {
  onConnect?: (extensionName: string) => void;
}


export interface SipConfig {
  username: string;
  password: string;
  domain: string;
}

export type ConnectStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'FAILED';