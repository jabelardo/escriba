
export interface AppConfig {
  openRouterApiKey?: string;
  openRouterModel?: string;
  lmStudioEndpoint?: string;
  lmStudioModel?: string;
  ollamaEndpoint?: string;
  ollamaModel?: string;
  systemPrompt?: string;
  continuePrompt?: string;
  reviewPrompt?: string;
  githubId?: string;
  githubSecret?: string;
}

const CONFIG_KEY = "escriba_config";

export const saveConfig = (config: AppConfig) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
};

export const loadConfig = (): AppConfig => {
  if (typeof window !== "undefined") {
    const storedConfig = localStorage.getItem(CONFIG_KEY);
    return storedConfig ? JSON.parse(storedConfig) : {};
  }
  return {};
};

export const exportConfig = () => {
  const config = loadConfig();
  const dataStr = JSON.stringify(config, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "escriba_config.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importConfig = (file: File): Promise<AppConfig> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedConfig: AppConfig = JSON.parse(event.target?.result as string);
        saveConfig(importedConfig);
        resolve(importedConfig);
      } catch {
        reject(new Error("Invalid JSON file."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };
    reader.readAsText(file);
  });
};
