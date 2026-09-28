/**
 * NexusIT Platform Abstraction Layer (PAL)
 * Bridges Windows 10/11 & Linux desktop host capabilities with graceful browser fallback.
 */

export interface SystemInfo {
  os: 'windows' | 'linux' | 'web';
  arch: string;
  isNativeDesktop: boolean;
}

export const pal = {
  getSystemInfo(): SystemInfo {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    const userAgent = navigator.userAgent.toLowerCase();
    
    let os: 'windows' | 'linux' | 'web' = 'web';
    if (userAgent.includes('win')) os = 'windows';
    else if (userAgent.includes('linux')) os = 'linux';
    
    return {
      os,
      arch: navigator.platform || 'x64',
      isNativeDesktop: isTauri
    };
  },

  async sendNotification(title: string, body: string): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    }
  },

  async downloadFile(filename: string, content: string | Blob, mimeType = 'text/plain'): Promise<void> {
    const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
};
