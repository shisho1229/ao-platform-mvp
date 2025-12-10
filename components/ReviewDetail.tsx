'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  DollarSign,
  Clock,
  FileCheck
} from 'lucide-react';

interface Experience {
  id: string;
  university: string;
  faculty: string;
  year: number;
  authorPseudonym: string;
  jukuCampus: string;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string | null;
  selectionProcess: string;
  interviewQuestions: string;
  interviewAtmosphere: string;
  preparationTips: string;
  adviceToJuniors: string;
  motivationTheme: string | null;
  motivationStructure: string | null;
  status: string;
  reviewComments: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  paymentStatus: string;
  paymentAmount: number | null;
  paymentDate: string | null;
  createdAt: string;
}

interface ReviewDetailProps {
  experience: Experience;
  reviewerName: string;
}

export default function ReviewDetail({ experience, reviewerName }: ReviewDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [revisionComments, setRevisionComments] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('5000');

  const handleRequestRevision = async () => {
    if (!revisionComments.trim()) {
      alert('修正内容を入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/experiences/review/${experience.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_revision',
          reviewComments: revisionComments,
          reviewedBy: reviewerName,
        }),
      });

      if (!response.ok) throw new Error('修正依頼に失敗しました');

      router.refresh();
      setShowRevisionForm(false);
      setRevisionComments('');
    } catch (error) {
      alert(error instanceof Error ? error.message : '修正依頼に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('この体験記を承認しますか？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/experiences/review/${experience.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          reviewedBy: reviewerName,
        }),
      });

      if (!response.ok) throw new Error('承認に失敗しました');

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '承認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('この体験記を公開しますか？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/experiences/review/${experience.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
        }),
      });

      if (!response.ok) throw new Error('公開に失敗しました');

      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : '公開に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    const amount = parseInt(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('正しい金額を入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/experiences/review/${experience.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          paymentAmount: amount,
        }),
      });

      if (!response.ok) throw new Error('支払い記録に失敗しました');

      router.refresh();
      setShowPaymentForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : '支払い記録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      PENDING_REVIEW: { label: '審査待ち', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      REVISION_REQUESTED: { label: '修正依頼中', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      APPROVED: { label: '承認済み', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      PUBLISHED: { label: '公開中', color: 'bg-blue-100 text-blue-800', icon: FileCheck },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/review" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>レビュー一覧に戻る</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AO Compass
            </h1>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* ステータスとアクション */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusBadge(experience.status)}
              <span className="text-sm text-gray-500">
                投稿日: {new Date(experience.createdAt).toLocaleDateString('ja-JP')}
              </span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-3">
            {experience.status === 'PENDING_REVIEW' && (
              <>
                <button
                  onClick={() => setShowRevisionForm(!showRevisionForm)}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  修正依頼
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  承認
                </button>
              </>
            )}

            {experience.status === 'APPROVED' && (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                公開
              </button>
            )}

            {(experience.status === 'PUBLISHED' || experience.status === 'APPROVED') &&
             experience.paymentStatus !== 'COMPLETED' && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                報酬記録
              </button>
            )}
          </div>

          {/* 修正依頼フォーム */}
          {showRevisionForm && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-bold text-gray-900 mb-2">修正依頼内容</h3>
              <textarea
                value={revisionComments}
                onChange={(e) => setRevisionComments(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="修正してほしい内容を具体的に記入してください..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRequestRevision}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                >
                  送信
                </button>
                <button
                  onClick={() => setShowRevisionForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* 報酬記録フォーム */}
          {showPaymentForm && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-2">報酬金額</h3>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="5000"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRecordPayment}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  記録
                </button>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        {/* レビュー履歴 */}
        {experience.reviewComments && (
          <div className="bg-orange-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              レビューコメント
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap mb-2">{experience.reviewComments}</p>
            {experience.reviewedBy && (
              <p className="text-sm text-gray-500">
                レビュアー: {experience.reviewedBy} | {experience.reviewedAt && new Date(experience.reviewedAt).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        )}

        {/* 報酬情報 */}
        {experience.paymentStatus === 'COMPLETED' && (
          <div className="bg-green-50 rounded-xl p-6 mb-6 border-2 border-green-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              報酬情報
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">支払い金額</p>
                <p className="text-2xl font-bold text-green-600">¥{experience.paymentAmount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">支払い日</p>
                <p className="text-lg font-semibold text-gray-900">
                  {experience.paymentDate && new Date(experience.paymentDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 投稿者情報 */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">投稿者情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">氏名</p>
              <p className="font-semibold text-gray-900">{experience.submitterName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">メールアドレス</p>
              <p className="font-semibold text-gray-900">{experience.submitterEmail}</p>
            </div>
            {experience.submitterPhone && (
              <div>
                <p className="text-sm text-gray-600">電話番号</p>
                <p className="font-semibold text-gray-900">{experience.submitterPhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">ペンネーム</p>
              <p className="font-semibold text-gray-900">{experience.authorPseudonym}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loohcs志塾の校舎</p>
              <p className="font-semibold text-gray-900">
                {experience.jukuCampus === '自力合格' ? '自力合格' : `${experience.jukuCampus}校`}
              </p>
            </div>
          </div>
        </div>

        {/* 合格情報 */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">合格情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">大学</p>
              <p className="font-semibold text-gray-900">{experience.university}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">学部</p>
              <p className="font-semibold text-gray-900">{experience.faculty}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">年度</p>
              <p className="font-semibold text-gray-900">{experience.year}年度</p>
            </div>
          </div>
        </div>

        {/* 選考情報 */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">選考情報</h2>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">選考プロセス</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{experience.selectionProcess}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">面接での質問内容</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{experience.interviewQuestions}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">面接の雰囲気</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{experience.interviewAtmosphere}</p>
          </div>
        </div>

        {/* アドバイス */}
        <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">アドバイス</h2>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">準備のコツ</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{experience.preparationTips}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">後輩へのアドバイス</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{experience.adviceToJuniors}</p>
          </div>
        </div>

        {/* 志望理由書（オプション） */}
        {(experience.motivationTheme || experience.motivationStructure) && (
          <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">志望理由書</h2>

            {experience.motivationTheme && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">テーマ</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{experience.motivationTheme}</p>
              </div>
            )}

            {experience.motivationStructure && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">構成</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{experience.motivationStructure}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
