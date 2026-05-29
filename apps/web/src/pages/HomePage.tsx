import { useState } from 'react';

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-5xl font-bold text-ow-orange">
        Pro-OW
      </h1>
      <p className="text-xl text-gray-400">
        守望先锋社区论坛
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="px-6 py-2 bg-ow-blue rounded-lg hover:bg-blue-600 transition-colors"
        >
          登录
        </a>
        <a
          href="/register"
          className="px-6 py-2 border border-gray-500 rounded-lg hover:border-ow-orange transition-colors"
        >
          注册
        </a>
      </div>
      <p className="text-gray-600 text-sm mt-8">
        MVP v0.1 — 项目脚手架已就绪
      </p>
    </div>
  );
}
