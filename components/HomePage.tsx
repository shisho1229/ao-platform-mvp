'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Award, Heart, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Story {
  id: string;
  university: string;
  faculty: string;
  admissionType: string;
  year?: number;
  campus?: string;
  highSchoolName?: string;
  authorName?: string;
  researchTheme?: string;
  firstRoundResult?: string;
  secondRoundResult?: string;
  author: {
    name: string;
    campus?: string;
  };
  explorationThemes: Array<{
    theme: {
      id: number;
      name: string;
    };
  }>;
  createdAt: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then(res => res.json())
      .then(data => {
        const stories = Array.isArray(data) ? data : [];
        setStories(stories.slice(0, 10)); // 最新10件
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getAdmissionResult = (admissionType: string, firstRound?: string, secondRound?: string) => {
    const isFIT = admissionType.includes("FIT");

    if (secondRound && ["合格", "AB合格", "A合格", "B合格"].includes(secondRound)) {
      if (isFIT) {
        if (firstRound === "AB合格") return { label: "最終AB合格", color: "bg-green-500" };
        if (firstRound === "A合格") return { label: "最終A合格", color: "bg-green-500" };
        if (firstRound === "B合格") return { label: "最終B合格", color: "bg-green-500" };
        return { label: "最終合格", color: "bg-green-500" };
      }
      return { label: "最終合格", color: "bg-green-500" };
    }

    if (firstRound && ["合格", "AB合格", "A合格", "B合格"].includes(firstRound)) {
      if (isFIT) {
        if (firstRound === "AB合格") return { label: "書類AB合格", color: "bg-blue-500" };
        if (firstRound === "A合格") return { label: "書類A合格", color: "bg-blue-500" };
        if (firstRound === "B合格") return { label: "書類B合格", color: "bg-blue-500" };
        return { label: "書類合格", color: "bg-blue-500" };
      }
      return { label: "書類合格", color: "bg-blue-500" };
    }

    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #044465 0%, #055a7a 40%, #0891b2 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* 左側: ナビゲーションボタン（縦並び） */}
          <div className="w-80 flex-shrink-0 space-y-4">
            <Link href="/stories" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <BookOpen className="w-12 h-12 mb-4" style={{ color: '#044465' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: '#044465' }}>体験談一覧</h3>
              <p className="text-gray-600">
                合格者の体験談を閲覧できます
              </p>
            </Link>

            <Link href="/search" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Search className="w-12 h-12 mb-4" style={{ color: '#044465' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: '#044465' }}>類似検索</h3>
              <p className="text-gray-600">
                あなたに近い合格者を探せます
              </p>
            </Link>

            <Link href="/favorites" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Heart className="w-12 h-12 mb-4" style={{ color: '#044465' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: '#044465' }}>お気に入り</h3>
              <p className="text-gray-600">
                お気に入りの体験談を管理できます
              </p>
            </Link>

            {session?.user && (
              <Link
                href="/stories/new"
                className="block p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
                }}
              >
                <Award className="w-12 h-12 mb-4 text-white" />
                <h3 className="text-xl font-bold mb-2 text-white">体験談を投稿する</h3>
                <p className="text-green-50">
                  あなたの合格体験を後輩に共有しましょう
                </p>
              </Link>
            )}
          </div>

          {/* 右側: タイトル・キャッチコピー + 最新体験談 */}
          <div className="flex-1">
            {/* 上部: タイトル・キャッチコピー */}
            <section className="mb-8">
              <h2 className="text-5xl font-bold mb-4" style={{ color: '#f0f4f8' }}>
                Loohcs志塾 合格者体験談
              </h2>
              <p className="text-2xl mb-3" style={{ color: '#d4af37' }}>
                志を抱く、場所となる。
              </p>
              <p className="text-lg" style={{ color: '#e8eef5' }}>
                どんな受験生も、どんな志望校も、<br />
                人生が変わるほどの成長と合格を掴み取れます。
              </p>
            </section>

            {/* 下部: 最新の体験談一覧 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#044465' }}>最新の体験談</h3>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
                  <p className="text-gray-600 mt-4">読み込み中...</p>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  まだ体験談が投稿されていません
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {stories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.id}`}
                      className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                      style={{ borderColor: '#e5e7eb' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#bac9d0'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      {/* カードヘッダー - グラデーション背景 */}
                      <div className="p-4 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #044465, #055a7a)' }}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
                        <div className="relative">
                          {/* 公開通知 */}
                          {story.authorName && (
                            <div className="mb-2 text-xs text-green-200 font-medium">
                              {story.authorName}さんの体験談が公開されました
                            </div>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h2 className="text-base font-bold text-white mb-1 group-hover:scale-105 transition-transform leading-tight">
                                {story.university}
                              </h2>
                              <p className="text-xs font-medium leading-tight" style={{ color: '#bac9d0' }}>{story.faculty}</p>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <div className="inline-block px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                              {story.admissionType}
                            </div>
                            {story.year && (
                              <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                {story.year}年度
                              </div>
                            )}
                            {(() => {
                              const result = getAdmissionResult(story.admissionType, story.firstRoundResult, story.secondRoundResult);
                              return result ? (
                                <div className={`inline-block px-2 py-0.5 ${result.color} text-white text-xs font-semibold rounded-full`}>
                                  {result.label}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* カードボディ */}
                      <div className="p-4">
                        {/* 投稿者情報 */}
                        <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                          {story.highSchoolName && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#044465' }} />
                              <p className="text-xs font-semibold leading-tight" style={{ color: '#044465' }}>
                                {story.highSchoolName}
                              </p>
                            </div>
                          )}
                          {story.campus && (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#044465' }} />
                              <p className="text-xs leading-tight" style={{ color: '#044465' }}>
                                {story.campus}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 志 */}
                        {story.researchTheme && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">志</p>
                            <p className="text-xs text-gray-700 line-clamp-2 leading-tight">
                              {story.researchTheme}
                            </p>
                          </div>
                        )}

                        {/* 探究テーマタグ */}
                        {story.explorationThemes.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">探究テーマ</p>
                            <div className="flex flex-wrap gap-1">
                              {story.explorationThemes.slice(0, 2).map((et) => (
                                <span
                                  key={et.theme.id}
                                  className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full border"
                                  style={{ color: '#044465', borderColor: '#bac9d0' }}
                                >
                                  {et.theme.name}
                                </span>
                              ))}
                              {story.explorationThemes.length > 2 && (
                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-gray-500">
                                  +{story.explorationThemes.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}