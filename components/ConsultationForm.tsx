'use client';

import React, { useState } from 'react';
import { Phone, Calendar, Clock, CheckCircle, User, Mail, School, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ConsultationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    university: '',
    faculty: '',
    consultationType: 'online',
    preferredDate: '',
    preferredTime: '',
    concerns: '',
    jukuName: 'AO義塾',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('予約完了:', data.trackingId);
        setSubmitted(true);
      } else {
        alert('エラーが発生しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            予約が完了しました!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            ご予約ありがとうございます。<br />
            AO義塾から24時間以内に確認のご連絡をさせていただきます。
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">📧 確認メールを送信しました</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ <strong>{formData.email}</strong> にメールを送信しました</p>
              <p>✅ 予約日時: {formData.preferredDate} {formData.preferredTime}</p>
              <p>✅ 相談方法: {formData.consultationType === 'online' ? 'オンライン(Zoom)' : '対面(渋谷オフィス)'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/">
              <button className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition text-lg">
                トップページに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold mb-4">
            <Phone className="w-4 h-4" />
            無料相談予約
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AO義塾 無料相談予約
          </h1>
          <p className="text-lg text-gray-600">
            実際の合格者書類を見ながら、プロ講師があなたの合格戦略をアドバイスします
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  step >= s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className={step >= 1 ? 'text-blue-600' : 'text-gray-500'}>基本情報</span>
            <span className={step >= 2 ? 'text-blue-600' : 'text-gray-500'}>志望校・相談内容</span>
            <span className={step >= 3 ? 'text-blue-600' : 'text-gray-500'}>日時選択</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                基本情報を入力してください
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="山田太郎"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="090-1234-5678"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  学年 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                >
                  <option value="">選択してください</option>
                  <option value="high3">高校3年生</option>
                  <option value="high2">高校2年生</option>
                  <option value="high1">高校1年生</option>
                  <option value="graduate">既卒生</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <School className="w-6 h-6 text-blue-600" />
                志望校と相談内容
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  第一志望校 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  placeholder="例: 早稲田大学"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  学部 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => handleChange('faculty', e.target.value)}
                  placeholder="例: 政治経済学部"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  相談したいこと <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.concerns}
                  onChange={(e) => handleChange('concerns', e.target.value)}
                  placeholder="例:&#10;・志望理由書の書き方を教えてほしい&#10;・合格者の書類を見てみたい&#10;・面接対策について相談したい"
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                相談日時を選択
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  相談方法 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('consultationType', 'online')}
                    className={`p-4 border-2 rounded-xl font-semibold transition ${
                      formData.consultationType === 'online'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">💻</div>
                      <div>オンライン</div>
                      <div className="text-xs mt-1 opacity-70">(Zoom)</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('consultationType', 'offline')}
                    className={`p-4 border-2 rounded-xl font-semibold transition ${
                      formData.consultationType === 'offline'
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏢</div>
                      <div>対面</div>
                      <div className="text-xs mt-1 opacity-70">(渋谷オフィス)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  希望日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleChange('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  希望時間帯 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    '10:00-11:00',
                    '11:00-12:00',
                    '13:00-14:00',
                    '14:00-15:00',
                    '15:00-16:00',
                    '16:00-17:00',
                    '17:00-18:00',
                    '18:00-19:00'
                  ].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleChange('preferredTime', time)}
                      className={`p-3 border-2 rounded-lg font-semibold transition ${
                        formData.preferredTime === time
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Clock className="w-4 h-4 inline mr-1" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition text-lg"
            >
              戻る
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition text-lg flex items-center justify-center gap-2"
            >
              次へ
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? '送信中...' : '予約を確定する'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}