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

  const getUniversityColor = (university: string) => {
    if (university.includes('慶應義塾大学') || university.includes('慶応義塾大学')) {
      return 'linear-gradient(to bottom right, #044465, #055a7a)';
    } else if (university.includes('早稲田大学')) {
      return 'linear-gradient(to bottom right, #8B1C1C, #A02020)';
    } else if (university.includes('上智大学')) {
      return 'linear-gradient(to bottom right, #C65D7B, #D4788F)';
    } else if (university.includes('青山学院大学')) {
      return 'linear-gradient(to bottom right, #1E6B4E, #228B5E)';
    } else if (university.includes('明治大学')) {
      return 'linear-gradient(to bottom right, #6B46C1, #7C3AED)';
    } else if (university.includes('立教大学')) {
      return 'linear-gradient(to bottom right, #312E81, #4338CA)';
    } else if (university.includes('中央大学')) {
      return 'linear-gradient(to bottom right, #B91C1C, #DC2626)';
    } else if (university.includes('学習院大学')) {
      return 'linear-gradient(to bottom right, #1E40AF, #2563EB)';
    }
    // デフォルトは慶應の色
    return 'linear-gradient(to bottom right, #044465, #055a7a)';
  };

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
              <h3 className="text-xl font-bold mb-2" style={{ color: '#044465' }}>体験記一覧</h3>
              <p className="text-gray-600">
                合格者の体験記を閲覧できます
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
                お気に入りの体験記を管理できます
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
                <h3 className="text-xl font-bold mb-2 text-white">体験記を投稿する</h3>
                <p className="text-green-50">
                  合格体験記を後輩に共有しましょう
                </p>
              </Link>
            )}
          </div>

          {/* 右側: タイトル・キャッチコピー + 最新体験記 */}
          <div className="flex-1">
            {/* 上部: タイトル・キャッチコピーと合格実績 */}
            <section className="mb-12">
              <div className="flex gap-6 items-start">
                {/* タイトル・キャッチコピー（左側） */}
                <div className="flex-1">
                  <h2 className="text-5xl font-bold mb-4" style={{ color: '#f0f4f8' }}>
                    Loohcs志塾 合格者体験記
                  </h2>
                  <p className="text-2xl mb-3" style={{ color: '#d4af37' }}>
                    志を抱く、場所となる。
                  </p>
                  <p className="text-lg" style={{ color: '#e8eef5' }}>
                    どんな受験生も、どんな志望校も、<br />
                    人生が変わるほどの成長と合格を掴み取れます。
                  </p>
                </div>

                {/* 合格実績（右側） */}
                <div className="rounded-xl p-6 shadow-xl w-96 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #044465 0%, #055a7a 50%, #0891b2 100%)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">2026年度合格実績</h3>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-md">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <p className="text-xs font-bold mb-1" style={{ color: '#044465' }}>14年連続</p>
                        <p className="text-sm font-bold" style={{ color: '#044465' }}>
                          慶應義塾大学合格者<br />
                          <span className="text-3xl font-extrabold" style={{ color: '#044465' }}>100名</span>超え
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          <p className="text-sm font-bold" style={{ color: '#044465' }}>
                            法学部：<span className="text-2xl font-extrabold" style={{ color: '#044465' }}>64名</span>
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#044465' }}>
                            SFC：<span className="text-2xl font-extrabold" style={{ color: '#044465' }}>46名</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 下部: 最新の体験記一覧 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#044465' }}>最新の体験記</h3>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#044465', borderTopColor: 'transparent' }}></div>
                  <p className="text-gray-600 mt-4">読み込み中...</p>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  まだ体験記が投稿されていません
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {stories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.id}`}
                      className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
                      style={{ borderColor: '#e5e7eb' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#bac9d0'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      {/* カードヘッダー - グラデーション背景 */}
                      <div className="p-2.5 relative overflow-hidden" style={{ background: getUniversityColor(story.university) }}>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
                        <div className="relative">
                          {/* 公開通知 */}
                          {story.authorName && (
                            <div className="mb-1 text-xs text-green-200 font-medium">
                              {story.authorName}さんの体験記が公開されました
                            </div>
                          )}
                          {/* 大学名と学部を縦に並べる */}
                          <div className="mb-1.5">
                            <h2 className="text-sm font-bold text-white mb-0.5 group-hover:scale-105 transition-transform leading-tight">
                              {story.university}
                            </h2>
                            <p className="text-xs font-medium leading-tight" style={{ color: '#bac9d0' }}>{story.faculty}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <div className="inline-block px-1.5 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                              {story.admissionType}
                            </div>
                            {story.year && (
                              <div className="inline-block px-1.5 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                {story.year}年度
                              </div>
                            )}
                            {(() => {
                              const result = getAdmissionResult(story.admissionType, story.firstRoundResult, story.secondRoundResult);
                              return result ? (
                                <div className={`inline-block px-1.5 py-0.5 ${result.color} text-white text-xs font-semibold rounded-full`}>
                                  {result.label}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* カードボディ */}
                      <div className="p-2.5">
                        {/* 投稿者情報 */}
                        <div className="mb-2 p-1.5 rounded-lg" style={{ backgroundColor: '#f0f4f5' }}>
                          {story.highSchoolName && (
                            <div className="flex items-center gap-1 mb-0.5">
                              <GraduationCap className="w-3 h-3 flex-shrink-0" style={{ color: '#044465' }} />
                              <p className="text-xs font-semibold leading-tight" style={{ color: '#044465' }}>
                                {story.highSchoolName}
                              </p>
                            </div>
                          )}
                          {story.campus && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: '#044465' }} />
                              <p className="text-xs leading-tight" style={{ color: '#044465' }}>
                                {story.campus}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 志 - 大きく目立たせる */}
                        {story.researchTheme && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold mb-1">志</p>
                            <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">
                              {story.researchTheme}
                            </p>
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