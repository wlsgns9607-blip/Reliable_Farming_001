import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Share2, Volume2, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Boast() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const playInstruction = () => {
    window.speechSynthesis.cancel();
    const text = "농부님, 든든자랑 페이지에 오신 것을 환영합니다! 이곳에서는 오늘 땀 흘려 수확한 작물을 자랑하고, 다른 농부님들과 소통할 수 있습니다. 화면 중앙의 진한 초록색 버튼을 눌러 사진과 함께 자랑글을 올려보세요. 이웃 농부님들의 게시글에 칭찬하기 버튼을 눌러 따뜻한 응원도 남길 수 있습니다.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const [posts, setPosts] = useState([
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
  ]);

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(post => 
      post.id === id 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
  };

  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col pb-6 relative">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#D1E8D1]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1E8449] border border-black/10">
            <Sprout size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black text-[#1E8449]">든든자랑</h1>
        </div>
        <button onClick={playInstruction} className="text-[#1E8449] p-2 active:scale-90 transition-transform">
          <Volume2 size={24} strokeWidth={2.5} />
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
          {posts.map(post => (
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
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 font-bold transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <motion.div animate={post.isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
                      <Heart size={22} strokeWidth={post.isLiked ? 0 : 2.5} className={post.isLiked ? "fill-red-500" : ""} />
                    </motion.div>
                    <span>{post.likes}</span>
                  </motion.button>
                  <button className="flex items-center gap-1.5 font-bold text-gray-600">
                    <MessageSquare size={22} strokeWidth={2.5} />
                    <span className="text-[13px]">칭찬하기 {post.comments}</span>
                  </button>
                </div>
                <button className="text-gray-500">
                  <Share2 size={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
