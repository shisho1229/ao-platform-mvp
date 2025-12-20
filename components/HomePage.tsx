'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Award } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Story {
  id: string;
  university: string;
  faculty: string;
  admissionType: string;
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
        setStories(stories.slice(0, 5));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          合格体験談プラットフォーム
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          あなたに近い合格者を見つけて、合格への道を探そう
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/stories" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">体験談一覧</h3>
            <p className="text-gray-600">
              合格者の体験談を閲覧できます
            </p>
          </Link>

          <Link href="/search" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <Search className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">類似検索</h3>
            <p className="text-gray-600">
              あなたに近い合格者を探せます
            </p>
          </Link>

          {session?.user?.role === 'USER' && (
            <Link href="/stories/new" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <Award className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">体験談投稿</h3>
              <p className="text-gray-600">
                あなたの体験談を投稿できます
              </p>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">最新の体験談</h3>
          {loading ? (
            <div className="text-center py-12">読み込み中...</div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              まだ体験談が投稿されていません
            </div>
          ) : (
            <div className="space-y-4">
              {stories.map((story) => (
                <Link key={story.id} href={`/stories/${story.id}`}>
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {story.university} {story.faculty}
                    </h4>
                    <p className="text-sm text-gray-600">{story.admissionType}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}