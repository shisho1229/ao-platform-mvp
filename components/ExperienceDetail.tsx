'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Eye, Phone } from 'lucide-react';
import Link from 'next/link';

interface Experience {
  id: string;
  university: string;
  faculty: string;
  year: number;
  authorPseudonym: string;
  jukuName?: string;
  selectionProcess: string;
  interviewQuestions: string[];
  interviewAtmosphere: string;
  preparationTips: string;
  adviceToJuniors: string;
  motivationTheme?: string;
  motivationStructure?: string;
  viewCount: number;
  createdAt: string;
}

interface ExperienceDetailProps {
  id: string;
}

export default function ExperienceDetail({ id }: ExperienceDetailProps) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetch(`/api/experiences/${id}`)
      .then(res => res.json())
      .then(data => {
        setExperience(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">体験記が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">トップに戻る</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              {experience.year}年度
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
              合格
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              {experience.viewCount}回閲覧
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {experience.university} {experience.faculty}
          </h1>

          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">投稿者: {experience.authorPseudonym}</span>
            </div>
            {experience.jukuName && (
              <div className="flex items-center gap-2">
                <span className="text-sm">提携塾: {experience.jukuName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'basic', label: '基本情報' },
                { id: 'interview', label: '面接' },
                { id: 'motivation', label: '志望理由書' },
                { id: 'tips', label: '対策' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">選考プロセス</h3>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700">
                    {experience.selectionProcess}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'interview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">面接の雰囲気</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {experience.interviewAtmosphere}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">面接質問</h3>
                  <div className="space-y-3">
                    {experience.interviewQuestions?.map((q: string, i: number) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex gap-3">
                          <span className="text-blue-600 font-bold">Q{i + 1}.</span>
                          <span className="text-gray-700">{q}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'motivation' && (
              <div className="space-y-6">
                {experience.motivationTheme && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">テーマ</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      {experience.motivationTheme}
                    </div>
                  </div>
                )}

                {experience.motivationStructure && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">構成</h3>
                    <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700">
                      {experience.motivationStructure}
                    </div>
                  </div>
                )}

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">📄 志望理由書の全文を読むには?</h3>
                  <p className="text-gray-600 mb-4">
                    この体験記は「{experience.jukuName || 'AO義塾'}」の協力で掲載されています。
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="font-semibold text-gray-900 mb-2">無料相談で閲覧できる内容:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✅ この志望理由書の全文(PDF)</li>
                      <li>✅ 活動報告書の全文</li>
                      <li>✅ プロ講師による詳細解説</li>
                      <li>✅ あなたの志望理由書を無料添削(1回)</li>
                    </ul>
                  </div>
                  <Link href="/consultation">
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
                      <Phone className="w-5 h-5" />
                      無料相談を予約する
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">準備・対策</h3>
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line text-gray-700">
                    {experience.preparationTips}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">後輩へのアドバイス</h3>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500 text-gray-700">
                    {experience.adviceToJuniors}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">もっと詳しく知りたい方へ</h3>
          <p className="text-lg mb-6 opacity-90">
            無料相談で、実際の合格者書類を見ながら合格戦略をアドバイス
          </p>
          <Link href="/consultation">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition text-lg">
              無料相談を予約する
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}