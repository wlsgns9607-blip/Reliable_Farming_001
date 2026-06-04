import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User, 
  Clock,
  Home,
  CalendarDays,
  FileText
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { saveComment, subscribeToComments } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [complaint, setComplaint] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadComplaint() {
      if (!id || !user) return;
      try {
        const docSnap = await getDoc(doc(db, 'complaints', id));
        if (docSnap.exists()) {
          setComplaint({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('내용을 찾을 수 없습니다.');
          navigate('/complaint');
        }
      } catch (error) {
        console.error(error);
        toast.error('불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    loadComplaint();

    if (id) {
      const unsubscribe = subscribeToComments(id, (newComments) => {
        setComments(newComments);
      });
      return () => unsubscribe();
    }
  }, [id, user]);

  const handleSendComment = async () => {
    if (!id || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await saveComment(id, newComment, user?.uid, user?.displayName || "가족");
      setNewComment('');
      toast.success('댓글이 등록되었습니다.');
    } catch (error) {
      console.error(error);
      toast.error('댓글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#D1E8D1] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="bg-[#D1E8D1] min-h-screen font-sans flex flex-col max-w-[430px] mx-auto overflow-hidden relative shadow-2xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {/* Main Complaint Card */}
        <div className="bg-white border-2 border-black rounded-[40px] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-bg border-2 border-black rounded-full flex items-center justify-center text-xl font-bold">
                {complaint.userId === user?.uid ? '나' : '식'}
             </div>
             <div>
                <p className="text-xl font-bold text-gray-800">
                  {complaint.userName || (complaint.userId === user?.uid ? '내가 쓴 글' : '동네 농부')}
                </p>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                   <Clock size={14} />
                   <span>
                      {complaint.createdAt ? format(complaint.createdAt.toDate(), 'PPP p', { locale: ko }) : ''}
                   </span>
                </div>
             </div>
          </div>

          <div className="text-[28px] font-black text-gray-800 leading-tight whitespace-pre-line">
             {complaint.content}
          </div>

          {complaint.imageUrl && (
            <div className="w-full h-64 border-2 border-black rounded-[32px] overflow-hidden">
               <img src={complaint.imageUrl} alt="불편함 사진" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <MessageCircle size={28} className="text-green-800" />
            <h2 className="text-2xl font-bold text-gray-800">해결소 답변 및 의견 ({comments.length})</h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-[28px] border-2 border-black ${
                    comment.userId === user?.uid ? 'bg-white ml-8 shadow-sm' : 'bg-[#E8F5E9] mr-8 shadow-md border-green-800'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${comment.userName?.includes('구청') || comment.userName?.includes('시청') ? 'text-green-700' : 'text-gray-800'}`}>
                        {comment.userName}
                      </span>
                      {(comment.userName?.includes('구청') || comment.userName?.includes('시청')) && (
                        <span className="bg-green-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">공식 답변</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-400">
                      {comment.createdAt ? format(comment.createdAt.toDate(), 'p', { locale: ko }) : ''}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-700 leading-snug">{comment.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {comments.length === 0 && (
              <p className="text-center py-6 text-xl font-bold text-gray-400">
                아직 등록된 답변이나 의견이 없습니다.<br/>잠시만 기다려주세요!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="bg-white border-t-2 border-black p-6 pb-10 fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-50">
         <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 border-2 border-black rounded-[24px] px-6 h-16 flex items-center shadow-inner">
               <input 
                 type="text" 
                 placeholder="답변 또는 의견을 입력하세요..."
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                 className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-gray-400"
               />
            </div>
            <button 
              onClick={handleSendComment}
              disabled={isSubmitting || !newComment.trim()}
              className="w-16 h-16 bg-[#66BB6A] text-white border-2 border-black rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 shadow-md"
            >
              <Send size={30} className="rotate-[-45deg] -mr-1 mt-1" />
            </button>
         </div>
      </div>
    </div>
  );
}
