'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import Link from 'next/link';
import { Award, ArrowLeft, FileText, Eye, Calendar } from 'lucide-react';

interface Document {
  id: string;
  university: string;
  faculty: string;
  year: number;
  documentType: string;
  title: string;
  jukuName: string;
  viewCount: number;
  createdAt: string;
}

interface DocumentListProps {
  session: Session;
}

export default function DocumentList({ session }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    university: '',
    documentType: '',
  });

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        setDocuments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    if (filter.university && !doc.university.includes(filter.university)) {
      return false;
    }
    if (filter.documentType && doc.documentType !== filter.documentType) {
      return false;
    }
    return true;
  });

  const documentTypes = Array.from(new Set(documents.map((d) => d.documentType)));

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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ダッシュボードに戻る
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">書類一覧</h2>
          <p className="text-gray-600">登録された書類を閲覧できます</p>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">大学名で検索</label>
              <input
                type="text"
                value={filter.university}
                onChange={(e) => setFilter({ ...filter, university: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: 慶應義塾大学"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">書類種別</label>
              <select
                value={filter.documentType}
                onChange={(e) => setFilter({ ...filter, documentType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">すべて</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 書類リスト */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">書類が見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {doc.year}年度
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                          {doc.documentType}
                        </span>
                        <span className="text-sm text-gray-500">{doc.jukuName}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {doc.university} {doc.faculty}
                      </h3>
                      <p className="text-gray-700 mb-3">{doc.title}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{doc.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(doc.createdAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                    <FileText className="w-8 h-8 text-gray-400" />
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
