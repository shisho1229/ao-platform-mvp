'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Award, Send } from 'lucide-react';
import { getCampuses } from '@/lib/jukuData';

export default function SubmitExperiencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // 個人情報
    submitterName: '',
    submitterEmail: '',
    submitterPhone: '',

    // 体験記情報
    university: '',
    faculty: '',
    year: new Date().getFullYear(),
    authorPseudonym: '',
    jukuCampus: '自力合格',

    // 選考情報
    selectionProcess: '',
    interviewQuestions: '',
    interviewAtmosphere: '',

    // アドバイス
    preparationTips: '',
    adviceToJuniors: '',

    // 志望理由書（オプション）
    motivationTheme: '',
    motivationStructure: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/experiences/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('投稿に失敗しました');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">投稿ありがとうございます！</h2>
            <p className="text-gray-600 mb-6">
              体験記を受け付けました。本部にて内容を確認後、修正依頼または承認のご連絡を差し上げます。
            </p>
            <p className="text-sm text-gray-500 mb-8">
              確認完了まで2-3営業日ほどお待ちください。
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">合格体験記を投稿する</h2>
          <p className="text-gray-600">
            あなたの経験が、後輩受験生の役に立ちます。<br />
            承認後、謝礼をお支払いいたします。
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* 個人情報 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">個人情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前（本名） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="山田太郎"
                  />
                  <p className="text-xs text-gray-500 mt-1">※謝礼のお支払いに使用します（公開されません）</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電話番号（オプション）
                  </label>
                  <input
                    type="tel"
                    value={formData.submitterPhone}
                    onChange={(e) => setFormData({ ...formData, submitterPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>
            </section>

            {/* 基本情報 */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">合格情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    大学名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 早稲田大学"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学部・学科 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 政治経済学部"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年度 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="2000"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ペンネーム <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorPseudonym}
                    onChange={(e) => setFormData({ ...formData, authorPseudonym: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 匿名A"
                  />
                  <p className="text-xs text-gray-500 mt-1">※サイト上で表示される名前です</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  通っていたLoohcs志塾の校舎 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.jukuCampus}
                  onChange={(e) => setFormData({ ...formData, jukuCampus: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getCampuses().map((campus) => (
                    <option key={campus} value={campus}>
                      {campus === '自力合格' ? '自力合格（Loohcs志塾に通っていない）' : `${campus}校`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">※Loohcs志塾に通っていない場合は「自力合格」を選択してください</p>
              </div>
            </section>

            {/* 選考プロセス */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">選考プロセス</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選考プロセス <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.selectionProcess}
                    onChange={(e) => setFormData({ ...formData, selectionProcess: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 一次選考: 書類審査（志望理由書1,200字、活動報告書800字）&#10;二次選考: 個人面接30分"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    面接で聞かれた質問 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.interviewQuestions}
                    onChange={(e) => setFormData({ ...formData, interviewQuestions: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="各質問を改行で区切って入力してください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    面接の雰囲気 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.interviewAtmosphere}
                    onChange={(e) => setFormData({ ...formData, interviewAtmosphere: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="面接の雰囲気や面接官の様子などを教えてください"
                  />
                </div>
              </div>
            </section>

            {/* アドバイス */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">後輩へのアドバイス</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    準備のコツ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.preparationTips}
                    onChange={(e) => setFormData({ ...formData, preparationTips: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="合格のために工夫したこと、準備で重視したポイントなどを教えてください"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    後輩へのアドバイス <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.adviceToJuniors}
                    onChange={(e) => setFormData({ ...formData, adviceToJuniors: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="これから受験する後輩へのメッセージをお願いします"
                  />
                </div>
              </div>
            </section>

            {/* 志望理由書（オプション） */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">志望理由書について（オプション）</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    志望理由書のテーマ
                  </label>
                  <input
                    type="text"
                    value={formData.motivationTheme}
                    onChange={(e) => setFormData({ ...formData, motivationTheme: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 地域経済の活性化とデータ分析"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    志望理由書の構成
                  </label>
                  <textarea
                    value={formData.motivationStructure}
                    onChange={(e) => setFormData({ ...formData, motivationStructure: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: 第1段落: 問題意識&#10;第2段落: 自身の経験&#10;第3段落: 大学で学びたいこと&#10;第4段落: 卒業後のビジョン"
                  />
                </div>
              </div>
            </section>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                {loading ? '送信中...' : '体験記を投稿する'}
              </button>
              <p className="text-sm text-gray-500 text-center mt-4">
                投稿後、本部にて内容を確認いたします。承認後、謝礼をお支払いいたします。
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
