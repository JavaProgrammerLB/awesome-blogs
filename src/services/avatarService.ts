import avatar from '../assets/avatar.webp';

// vite动态导入本地图片
const localAvatars = import.meta.glob('../assets/avatar/*', { eager: true, as: 'url' });

export function resolveAvatar(path: string): string {
  if (!path) return '';
  if (path === 'avatar.webp') return avatar;
  if (path.startsWith('avatar/')) {
    const key = `../assets/${path}`;
    if (localAvatars[key]) return localAvatars[key] as string;
    return avatar;
  }
  return path;
}