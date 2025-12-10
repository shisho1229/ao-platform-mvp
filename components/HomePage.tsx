'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Award, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';

interface Experience {
  id: string;
  university: string;
  faculty: string;
  year: number;
  jukuName?: string;
}

'use client';

import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Award, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/experiences')
      .then(res => res.json())
      .then(data => {
       const experiences = Array.isArray(data) ? data : [];
  setExperiences(experiences.slice(0, 3));
  setLoading(false);
})
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AO Compass
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition">体験記を探す</Link>
            <Link href="/consultation" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              無料相談予約
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          総合型選抜の<span className="text-blue-600">すべて</span>がここに
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          実際の合格体験記から、あなたの合格への道を見つけよう
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">最新の体験記</h3>
        </div>

        {loading ? (
          <div className="text-center py-12">読み込み中...</div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <Link key={exp.id} href={`/experiences/${exp.id}`}>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {exp.year}年度
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          合格
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        {exp.university} {exp.faculty}
                      </h4>
                      {exp.jukuName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>提携塾: {exp.jukuName}</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">無料相談を予約しよう</h3>
          <p className="text-xl mb-8 opacity-90">
  実際の合格者書類を見ながら、プロ講師があなたの合格戦略をアドバイス
</p>
 <Link href="/consultation">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition text-lg">
              無料相談を予約する
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}