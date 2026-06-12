import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Share2, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Boast() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const feed = [
    {
      id: 1,
      author: '경북 의성 - 김포근 농부님',
      avatar: '🧑‍🌾',
      badges: [{ text: '채소', type: 'bg-orange-100 text-orange-800' }, { text: '의성 마늘', type: 'bg-red-100 text-red-800' }],
      content: '"올해 가뭄 다 이겨내고 오늘 아침에 땅에서 캔 단단한 의성 육쪽마늘입니다. 알이 꽉 차서 알싸한 향이 아주 기가 막힙니다. 구경들 하고 가세요."',
      image: '/images/boast/img_001.png',
      likes: 128,
      comments: 42,
      isLiked: false
    },
    {
      id: 2,
      author: '전남 담양 - 박순정 농부님',
      avatar: '👩‍🌾',
      badges: [{ text: '과일', type: 'bg-orange-100 text-orange-800' }, { text: '담양 샤인머스켓', type: 'bg-orange-100 text-orange-800' }],
      content: '"새벽이슬 맞히면서 하우스에서 정성껏 키운 샤인머스켓입니다. 한 알 한 알 탱글탱글하게 수확 잘 되어서 자식 보내는 마음으로 올립니다."',
      image: '/images/boast/img_002.png',
      likes: 256,
      comments: 89,
      isLiked: true
    }
  ];

  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col pb-6 relative">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#D1E8D1]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-black/10">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Farmer" alt="avatar" className="w-full h-full object-cover" />
            )}
          </div>
          <h1 className="text-xl font-black text-[#1E8449]">든든자랑</h1>
        </div>
        <button className="text-[#1E8449] p-2">
          <Bell size={24} strokeWidth={2.5} />
        </button>
      </header>

      <div className="px-4 space-y-6 mt-2">
        {/* Write Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/boast/create')}
          className="w-full bg-[#2E7D32] text-white rounded-[24px] p-5 shadow-lg flex items-center justify-center gap-3 border-2 border-white/20"
        >
          <span className="text-2xl">✍️</span>
          <span className="text-[17px] font-bold">오늘 재배한 내 작물 자랑하러 가기</span>
        </motion.button>

        {/* Feed List */}
        <div className="space-y-6">
          {feed.map(post => (
            <div key={post.id} className="bg-white rounded-[32px] overflow-hidden shadow-md border border-gray-100">
              {/* Post Header */}
              <div className="p-5 flex gap-3 items-start">
                <div className="text-3xl bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-gray-100">
                  {post.avatar}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-[16px] font-bold text-gray-800 leading-tight mb-2">{post.author}</h3>
                  <div className="flex gap-2">
                    {post.badges.map((b, i) => (
                      <span key={i} className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold ${b.type}`}>
                        {b.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 pb-4">
                <p className="text-[15px] font-medium text-gray-700 leading-relaxed break-keep">
                  {post.content}
                </p>
              </div>

              {/* Image */}
              <div className="w-full h-[320px] bg-gray-100">
                <img src={post.image} alt="post" className="w-full h-full object-cover" />
              </div>

              {/* Bottom Bar */}
              <div className="px-5 py-4 flex items-center justify-between bg-[#F8FAF8]">
                <div className="flex gap-6">
                  <button className={`flex items-center gap-1.5 font-bold ${post.isLiked ? 'text-[#1E8449]' : 'text-gray-600'}`}>
                    <Heart size={20} strokeWidth={2.5} className={post.isLiked ? "fill-[#1E8449]" : ""} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 font-bold text-gray-600">
                    <MessageSquare size={20} strokeWidth={2.5} />
                    <span className="text-[13px]">칭찬하기 {post.comments}</span>
                  </button>
                </div>
                <button className="text-gray-500">
                  <Share2 size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
