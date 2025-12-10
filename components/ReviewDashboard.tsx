'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Award, FileCheck, Clock, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface Experience {
  id: string;
  university: string;
  faculty: string;
  year: number;
  authorPseudonym: string;
  jukuName: string;
  submitterName: string;
  submitterEmail: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface ReviewDashboardProps {
  session: Session;
}

export default function ReviewDashboard({ session }: ReviewDashboardProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const response = await fetch('/api/experiences/review');
      const data = await response.json();
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
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

  const getPaymentBadge = (paymentStatus: string) => {
    if (paymentStatus === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <DollarSign className="w-4 h-4" />
          支払い済み
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
        <DollarSign className="w-4 h-4" />
        未払い
      </span>
    );
  };

  const filteredExperiences = experiences.filter((exp) => {
    if (filter === 'ALL') return true;
    return exp.status === filter;
  });

  const stats = {
    pending: experiences.filter((e) => e.status === 'PENDING_REVIEW').length,
    revision: experiences.filter((e) => e.status === 'REVISION_REQUESTED').length,
    approved: experiences.filter((e) => e.status === 'APPROVED').length,
    published: experiences.filter((e) => e.status === 'PUBLISHED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AO Compass
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.name}</span>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              ダッシュボード
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">体験記レビュー管理</h2>
          <p className="text-gray-600">投稿された体験記を確認・承認します</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">審査待ち</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">修正依頼中</p>
                <p className="text-3xl font-bold text-orange-600">{stats.revision}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">承認済み</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">公開中</p>
                <p className="text-3xl font-bold text-blue-600">{stats.published}</p>
              </div>
              <FileCheck className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({experiences.length})
            </button>
            <button
              onClick={() => setFilter('PENDING_REVIEW')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'PENDING_REVIEW'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              審査待ち ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('REVISION_REQUESTED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'REVISION_REQUESTED'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              修正依頼中 ({stats.revision})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'APPROVED'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              承認済み ({stats.approved})
            </button>
            <button
              onClick={() => setFilter('PUBLISHED')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'PUBLISHED'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              公開中 ({stats.published})
            </button>
          </div>
        </div>

        {/* 体験記リスト */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">該当する体験記がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExperiences.map((exp) => (
              <Link key={exp.id} href={`/review/${exp.id}`}>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(exp.status)}
                        {getPaymentBadge(exp.paymentStatus)}
                        <span className="text-sm text-gray-500">
                          {new Date(exp.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {exp.university} {exp.faculty} ({exp.year}年度)
                      </h3>
                      <p className="text-gray-600 mb-2">
                        投稿者: {exp.submitterName} ({exp.submitterEmail})
                      </p>
                      <p className="text-sm text-gray-500">
                        ペンネーム: {exp.authorPseudonym} | 塾: {exp.jukuName}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
