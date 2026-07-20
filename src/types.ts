export interface ConfigItem {
  label: string;
  field?: string;
  getValue?: () => string | number | boolean | null | undefined;
  settable?: boolean;
}

export interface ConfigGroup {
  title: string;
  children: ConfigItem[];
}

export interface AESConfig {
  key: string;
  iv: string;
}

export interface RSAConfig {
  publicKey: string;
  privateKey?: string;
}

export interface EncryptionConfig {
  aes?: AESConfig;
  rsa?: RSAConfig;
}

export interface PanelOptions {
  id: string;
  name: string;
  items: ConfigGroup[];
  useState?: () => Record<string, any>;
  setState?: (data: Record<string, any>) => void;
  encryption?: EncryptionConfig;
}

export interface VConsolePlugin {
  on(event: string, callback: Function): void;
}