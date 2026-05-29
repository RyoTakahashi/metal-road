import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base を相対パスにすることで、GitHub Pages のプロジェクトサブパス
// (https://<user>.github.io/metal-road/) でもアセット参照が崩れない。
// このアプリはクライアントルーティングを持たない単一ページなので相対パスで問題ない。
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
});
