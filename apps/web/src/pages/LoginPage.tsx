export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-ow-darker rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">登录 Pro-OW</h2>
        <input
          type="email"
          placeholder="邮箱"
          className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none"
        />
        <input
          type="password"
          placeholder="密码"
          className="w-full p-3 mb-6 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none"
        />
        <button className="w-full p-3 bg-ow-blue rounded-lg font-bold hover:bg-blue-600 transition-colors">
          登录
        </button>
        <p className="text-center mt-4 text-gray-500">
          还没有账号？<a href="/register" className="text-ow-blue hover:underline">注册</a>
        </p>
      </div>
    </div>
  );
}
