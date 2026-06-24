import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full px-4">
      <div className="flex items-center mb-8">
        <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-black text-gray-800 ml-2">关于 脑力星球 (About)</h1>
      </div>

      <div className="prose prose-indigo max-w-none text-gray-600">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">🌍 我们的使命</h2>
          <p>
            「脑力星球」致力于为 3-12
            岁儿童提供一个**完全纯净、无任何广告、无需登陆注册**的极简益智游戏平台。
            我们坚信，最好的教育应该是易于获取且无负担的。在这里，孩子可以自由探索色彩、逻辑、数学与专注力。
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛡️ 极致的隐私保护</h2>
          <p>
            我们是互联网时代少数坚持**“零后端”**的产品。
            本平台没有连接任何数据库，你的游戏记录、积分和进度，统统只保存在你的这台设备的浏览器里（Local
            Storage）。 哪怕断开网络，所有的游戏依然可以畅玩无阻！
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">👨‍💻 开源与支持</h2>
          <p>
            本项目是一个完全开源的非营利项目，源代码托管在{" "}
            <a
              href="https://github.com/chicogong/brain-planet"
              target="_blank"
              className="text-indigo-600 font-bold hover:underline"
            >
              GitHub
            </a>
            。<br />
            如果这个平台对你的孩子有所帮助，欢迎分享给更多的家长。
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://kids.aimake.cc"
              target="_blank"
              className="inline-block bg-teal-50 text-teal-600 px-4 py-2 rounded-full font-bold hover:bg-teal-100 transition-colors"
            >
              官方访问地址
            </a>
            <Link
              href="/parents"
              className="inline-block bg-purple-50 text-purple-600 px-4 py-2 rounded-full font-bold hover:bg-purple-100 transition-colors"
            >
              家长数据看板
            </Link>
            <a
              href="https://chico.aimake.cc"
              target="_blank"
              className="inline-block bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-bold hover:bg-indigo-100 transition-colors"
            >
              了解作者 Chico
            </a>
            <a
              href="https://brain-planet.pages.dev"
              target="_blank"
              className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              备用节点
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
