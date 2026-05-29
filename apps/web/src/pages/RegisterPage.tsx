export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-ow-darker rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">注册 Pro-OW</h2>
        <input
          type="text"
          placeholder="用户名"
          className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none"
        />
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
          注册
        </button>
        <p className="text-center mt-4 text-gray-500">
          已有账号？<a href="/login" className="text-ow-blue hover:underline">登录</a>
        </p>
      </div>
    </div>
  );
}
