import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.resolve(process.cwd(), 'server-config.json');

interface ServerConfig {
  githubId?: string;
  githubSecret?: string;
}

export const loadServerConfig = (): ServerConfig => {
  if (fs.existsSync(CONFIG_FILE)) {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(configContent);
  }
  return {};
};

export const saveServerConfig = (config: ServerConfig) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
};
